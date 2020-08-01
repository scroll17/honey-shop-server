/*external modules*/
import 'reflect-metadata';
import * as yup from 'yup';
import _ from 'lodash';
import { Router, Application, RequestHandler } from 'express';
/*DB*/
import { DB, sql } from '../../db';
import { User } from '../../db/types/user';
/*@core*/
import {
  ClassMetaKey,
  TErrorMiddleware,
  IClass,
  IClassMetadata,
  RoutesMetaKey,
  SymCustomPath,
  PropRoutesMetaKey,
  IRouteMap,
  IPopRouteMap,
} from './decorators';
import { authenticateHandler, createCtx, setResLocals, validateHandler } from './utils';
/*other*/
import { TArray, TFunction } from '@honey/types';
import { ServerError } from '../error';

export * from './decorators';

export interface RouteContext {
  db: DB;
  sql: typeof sql;
  user: User;
  events: TFunction.DelayedEvent[];
  resolveEvents: () => Promise<void | Error>;
}

export function applyControllers<TController extends IClass>(
  app: Application,
  controllers: Array<TController>
): void {
  const errorMiddleware: Array<TArray.PossibleArray<TErrorMiddleware>> = [];

  controllers.forEach((controller) => {
    if (!Reflect.hasOwnMetadata(ClassMetaKey, controller)) {
      throw new ServerError(`"${controller.name}" not have metadata. Use class decorators.`);
    }

    const { routerOptions = {} }: IClassMetadata = Reflect.getOwnMetadata(ClassMetaKey, controller);
    const expressRoute = Router(routerOptions);

    const { prefix, errorHandlers } = expandClassMetadata(controller, expressRoute);
    errorMiddleware.push(errorHandlers);

    const paths: Set<string> = new Set();

    const controllerRoutes = Reflect.getOwnMetadata(RoutesMetaKey, controller.prototype);
    if (controllerRoutes.size > 0) {
      expandRoutesMetadata(controller.prototype, expressRoute, paths);
    }

    const propControllersRoutes = Reflect.getOwnMetadata(PropRoutesMetaKey, controller.prototype);
    if (propControllersRoutes.size > 0) {
      expandInjectedPropertyMetadata(controller.prototype, expressRoute, paths);
    }

    app.use(prefix, expressRoute);
  });

  errorMiddleware.flat().forEach((middleware) => app.use(middleware));
}

function expandClassMetadata<TController extends IClass>(
  controller: TController,
  Router: Router
): Pick<IClassMetadata, 'prefix' | 'errorHandlers'> {
  const { handlers, errorHandlers, prefix }: IClassMetadata = Reflect.getMetadata(ClassMetaKey, controller);

  if (!prefix) {
    throw new ServerError(`"${controller.name}" not have prefix. Use @Controller.`);
  }

  if (handlers) {
    handlers.forEach(({ prefix, handler }) => {
      if (prefix === '') {
        Router.use(handler);
      } else {
        if (Array.isArray(prefix)) {
          const regular = new RegExp(`(${prefix.join('|')})$`);
          Router.use(regular, handler);
        } else {
          Router.use(prefix, handler);
        }
      }
    });
  }

  return {
    prefix: prefix,
    errorHandlers: errorHandlers ?? [],
  };
}

function expandRoutesMetadata<TController extends IClass>(
  prototype: TController['prototype'],
  Router: Router,
  paths: Set<string>
) {
  const routes: IRouteMap = Reflect.getOwnMetadata(RoutesMetaKey, prototype);
  const controllerName = prototype.constructor.name;

  /** check required properties */
  routes.forEach((routeConfig) => {
    const path = _.get(routeConfig, SymCustomPath) ?? _.get(routeConfig, 'path');
    const method = routeConfig.requestMethod;

    if (!path) {
      throw new ServerError(
        `In "${controllerName}". Route must have a path. Use @Path or @Method(HttpVerb).`
      );
    }

    if (!method) {
      throw new ServerError(
        `In "${controllerName}". Route must have a request method. Use @Method(HttpVerb).`
      );
    }
  });

  /** check uniqueness of paths */
  routes.forEach((routeConfig) => {
    const pathToAdd = `${_.upperCase(routeConfig.requestMethod)} ${
      _.get(routeConfig, SymCustomPath) ?? _.get(routeConfig, 'path')
    }`;

    if (paths.has(pathToAdd)) {
      throw new ServerError(
        `In "${controllerName}". "${pathToAdd}" already exist. Route must have a unique path.`
      );
    } else {
      paths.add(pathToAdd);
    }
  });

  routes.forEach((routeConfig, methodName) => {
    const { ctxKeys, authRole, validateFunc } = routeConfig;

    const path = _.get(routeConfig, SymCustomPath) ?? _.get(routeConfig, 'path');
    const method = routeConfig.requestMethod;
    const [beforeHandlers = [], afterHandlers = []] = routeConfig.middleware ?? [];

    const resLocals = {};
    const targetHandlers: Array<RequestHandler> = [];

    validateFunc && _.set(resLocals, 'validateFunc', validateFunc);
    authRole && _.set(resLocals, 'authRole', authRole);

    if (!_.isEmpty(resLocals)) {
      targetHandlers.push(setResLocals(resLocals));

      if (_.has(resLocals, 'validateFunc')) {
        targetHandlers.push(validateHandler);
      }
      if (_.has(resLocals, 'authRole')) {
        targetHandlers.push(authenticateHandler);
      }
    }

    targetHandlers.push(async (req, res, next) => {
      const ctx = _.isEmpty(ctxKeys) ? {} : createCtx(ctxKeys!, req, res, next);
      await prototype[methodName]({ ctx, req, res, next });
    });

    Router[method](path, [...beforeHandlers, ...targetHandlers, ...afterHandlers]);
  });
}

function expandInjectedPropertyMetadata<TController extends IClass>(
  prototype: TController['prototype'],
  Router: Router,
  paths: Set<string>
) {
  const routes: IPopRouteMap = Reflect.getOwnMetadata(PropRoutesMetaKey, prototype);
  const controllerName = prototype.constructor.name;

  /** check uniqueness of paths */
  routes.forEach((routeConfig) => {
    const pathToAdd = `${_.upperCase(routeConfig.requestMethod)} ${_.get(routeConfig, 'path')}`;

    if (paths.has(pathToAdd)) {
      throw new ServerError(
        `In "${controllerName}". "${pathToAdd}" already exist. Route must have a unique path.`
      );
    } else {
      paths.add(pathToAdd);
    }
  });

  routes.forEach((routeConfig) => {
    const { path, requestMethod, handlerType } = routeConfig;

    const handlerInstance = new handlerType();

    const [beforeHandlers = [], afterHandlers = []] = handlerInstance.middleware ?? [];
    const targetHandlers: Array<RequestHandler> = [];

    const { role: authRole, ctx: ctxKeys } = handlerInstance.config ?? {};

    targetHandlers.push((req, res, next) => {
      handlerInstance.validate({ yup, req, next });
    });

    const resLocals = {};
    if (authRole) {
      _.set(resLocals, 'authRole', authRole);

      targetHandlers.push(setResLocals(resLocals));
      targetHandlers.push(authenticateHandler);
    }

    targetHandlers.push(async (req, res, next) => {
      const ctx = _.isEmpty(ctxKeys) ? {} : createCtx(ctxKeys!, req, res, next);
      await handlerInstance.action({ ctx, req, res, next });
    });

    Router[requestMethod](path, [...beforeHandlers, ...targetHandlers, ...afterHandlers]);
  });
}
