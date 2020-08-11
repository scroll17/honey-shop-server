/*external modules*/
import 'reflect-metadata';
import path from "path";
import fs from 'fs'
import * as yup from 'yup';
import _ from 'lodash';
import express, { IRouter, Application, RequestHandler } from 'express';
/*DB*/
import { DB, index } from '../../db';
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
  sql: typeof index;
  user: User;
  events: TFunction.DelayedEvent[];
  resolveEvents: () => Promise<void | Error>;
}

interface IStatistic {
  handlers: string;
  uses?: Map<string, IStatistic>;
  paths?: Set<string>;
}

let statistic: Map<string, IStatistic> | undefined;

export function applyControllers<TController extends IClass>(
  app: Application,
  controllers: Array<TController>,
  buildStatistic: boolean = false
): void {
  const errorMiddleware: Array<TArray.PossibleArray<TErrorMiddleware>> = [];

  /** create stat */
  if(buildStatistic) statistic = new Map()

  controllers.forEach((controller) => {
    if (!Reflect.hasOwnMetadata(ClassMetaKey, controller)) {
      throw new ServerError(`"${controller.name}" not have metadata. Use class decorators.`);
    }

    const { routerOptions = {} }: IClassMetadata = Reflect.getOwnMetadata(ClassMetaKey, controller);
    const expressRoute = express.Router(routerOptions);

    const { prefix, errorHandlers } = expandClassMetadata(controller, expressRoute, statistic);
    errorMiddleware.push(errorHandlers!);

    const paths: Set<string> = new Set();
    expandRoutesMetadata(controller.prototype, expressRoute, paths);
    expandInjectedPropertyMetadata(controller.prototype, expressRoute, paths);

    if(statistic) {
      const stat = statistic.get(prefix)!;
      statistic.set(prefix, {
        ...stat,
        paths
      })
    }

    app.use(prefix, expressRoute);
  });

  errorMiddleware.flat().forEach((middleware) => app.use(middleware));

  if(statistic) {
    const mainDirPath = path.join(__dirname, '../../../statistic.json');
    fs.writeFileSync(
      mainDirPath,
      JSON.stringify(parseStatistic(statistic), undefined, 2)
    )

    /** drop statistic */
    statistic = undefined
  }
}

function expandClassMetadata<TController extends IClass>(
  controller: TController,
  Router: IRouter,
  statistic?: Map<string, IStatistic>,
  customPrefix?: string,
): Pick<IClassMetadata, 'prefix' | 'errorHandlers'> {
  const { handlers, errorHandlers, prefix, children }: IClassMetadata = Reflect.getMetadata(
    ClassMetaKey,
    controller
  );

  if (!customPrefix && !prefix) {
    throw new ServerError(`"${controller.name}" not have prefix. Use @Controller.`);
  }

  if(statistic) {
    statistic.set(prefix || customPrefix!, {
      handlers: handlers?.map(({ handler}) => handler.name ?? '').join(',') ?? ''
    })
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

  if (children) {
    let nestedStat = statistic ? new Map() : undefined;

    children.forEach((value, key) => {
      if (!Reflect.hasOwnMetadata(ClassMetaKey, value)) {
        throw new ServerError(`"${value.name}" not have metadata. Use class decorators.`);
      }

      const { routerOptions = {} }: IClassMetadata = Reflect.getOwnMetadata(ClassMetaKey, value);
      const expressRoute = express.Router(routerOptions);

      expandClassMetadata(value, expressRoute, nestedStat, key);

      const paths: Set<string> = new Set();
      expandRoutesMetadata(value.prototype, expressRoute, paths);
      expandInjectedPropertyMetadata(value.prototype, expressRoute, paths);

      if(nestedStat) {
        const stat = nestedStat.get(key)!;
        nestedStat.set(key, {
          ...stat,
          paths
        })
      }

      Router.use(key, expressRoute);
    });

    if(statistic) {
      const stat = statistic.get(prefix || customPrefix!)!;
      statistic.set(prefix || customPrefix!, {
        ...stat,
        uses: nestedStat
      })
    }
  }

  return {
    prefix: prefix,
    errorHandlers: errorHandlers ?? [],
  };
}

function expandRoutesMetadata<TController extends IClass>(
  prototype: TController['prototype'],
  Router: IRouter,
  paths: Set<string>
) {
  const routes: IRouteMap = Reflect.getOwnMetadata(RoutesMetaKey, prototype);
  // exit if there are no routes
  if (routes.size === 0) return;

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
  Router: IRouter,
  paths: Set<string>
) {
  const routes: IPopRouteMap = Reflect.getOwnMetadata(PropRoutesMetaKey, prototype);
  // exit if there are no routes
  if (routes.size === 0) return;

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

    const [beforeHandlers = [], afterHandlers = []] = handlerInstance.middleware;
    const targetHandlers: Array<RequestHandler> = [];

    const { role: authRole, ctx: ctxKeys } = handlerInstance.config;

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


function parseStatistic(statistic: Map<string, IStatistic>): Record<string, any> {
  const objectStatistic: Record<string, any> = {};

  statistic.forEach((value, key) => {
    if(!_.isEmpty(value.handlers)) {
      objectStatistic[key] = {
        handlers: value.handlers
      }
    }
    if(value.paths && value.paths.size) {
      objectStatistic[key] = {
        ...objectStatistic[key],
        paths: [...value.paths]
      }
    }
    if(value.uses && value.uses.size) {
      objectStatistic[key] = {
        ...objectStatistic[key],
        paths: [
          parseStatistic(value.uses),
          ...(objectStatistic[key].paths ?? [])
        ],
      }
    }
  })

  return objectStatistic
}
