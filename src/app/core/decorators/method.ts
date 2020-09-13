/*external modules*/
import _ from 'lodash';
import { Request } from 'express';
/*DB*/
import { UserRole } from '../../../db/types/role';
/*@core*/
import {
  CtxMethodDecorator,
  HttpMethodDecorator,
  HttpVerb,
  IRouteConfig,
  IRouteMap,
  IRouteMetadata,
  MethodOptions,
  RoutesMetaKey,
  SymCustomPath,
  ValidateCallback,
} from './types';
/*other*/
import { ServerError } from '../../error';

/**
 *    "target" => class constructor (if static) / class.prototype
 *    "propertyKey" => key name
 *    "descriptor" => descriptor property key
 *
 *    return => If the method decorator returns a value, that value will be used as a Property Descriptor for the method.
 * */

/**
 *  middle -> Validate -> Authorization -> currentMethod(?createCtx?) -> middle
 * */

export const Get: HttpMethodDecorator = (options) => {
  return helperForRoutes(HttpVerb.GET, options);
};

export const Post: HttpMethodDecorator = (options) => {
  return helperForRoutes(HttpVerb.POST, options);
};

export const Put: HttpMethodDecorator = (options) => {
  return helperForRoutes(HttpVerb.PUT, options);
};

export const Delete: HttpMethodDecorator = (options) => {
  return helperForRoutes(HttpVerb.DELETE, options);
};

export const Validate = <TReq extends Request = Request>(cb: ValidateCallback<TReq>): MethodDecorator => {
  return (target, propertyKey) => {
    const routes: IRouteMap = Reflect.getOwnMetadata(RoutesMetaKey, target) ?? new Map();

    const routeConfig: IRouteMetadata = routes.get(propertyKey) ?? ({} as IRouteMetadata);
    routes.set(propertyKey, {
      ...routeConfig,
      validateFunc: cb,
    });

    Reflect.defineMetadata(RoutesMetaKey, routes, target);
  };
};

export const Config = (config: IRouteConfig): MethodDecorator => {
  const options = _.transform<any, any>(config, (result, value, key) => {
    if (_.isUndefined(value)) return false;

    switch (key) {
      case 'path': {
        result[SymCustomPath] = value;
        break;
      }
      case 'ctx': {
        result['ctxKeys'] = value;
        break;
      }
      case 'validate': {
        result['validateFunc'] = value;
        break;
      }
      case 'middleware': {
        result['middleware'] = value;
        break;
      }
      case 'role': {
        result['authRole'] = value;
        break;
      }
    }
  });

  return (target, propertyKey) => {
    const routes: IRouteMap = Reflect.getOwnMetadata(RoutesMetaKey, target) ?? new Map();

    const routeConfig: IRouteMetadata = routes.get(propertyKey) ?? ({} as IRouteMetadata);
    routes.set(propertyKey, {
      ...routeConfig,
      ...options,
    });

    Reflect.defineMetadata(RoutesMetaKey, routes, target);
  };
};

export const Authorization = (role: UserRole): MethodDecorator => {
  return (target, propertyKey) => {
    const routes: IRouteMap = Reflect.getOwnMetadata(RoutesMetaKey, target) ?? new Map();

    const routeConfig: IRouteMetadata = routes.get(propertyKey) ?? ({} as IRouteMetadata);
    routes.set(propertyKey, {
      ...routeConfig,
      authRole: role,
    });

    Reflect.defineMetadata(RoutesMetaKey, routes, target);
  };
};

export const Path = (path: string | RegExp): MethodDecorator => {
  return (target, propertyKey) => {
    const routes: IRouteMap = Reflect.getOwnMetadata(RoutesMetaKey, target) ?? new Map();

    const routeConfig: IRouteMetadata = routes.get(propertyKey) ?? ({} as IRouteMetadata);
    routes.set(propertyKey, {
      ...routeConfig,
      [SymCustomPath]: path,
    });

    Reflect.defineMetadata(RoutesMetaKey, routes, target);
  };
};

export const Ctx: CtxMethodDecorator = (keys, ...otherKeys) => {
  return (target, propertyKey) => {
    const routes: IRouteMap = Reflect.getOwnMetadata(RoutesMetaKey, target) ?? new Map();

    const routeConfig: IRouteMetadata = routes.get(propertyKey) ?? ({} as IRouteMetadata);
    routes.set(propertyKey, {
      ...routeConfig,
      ctxKeys: [keys, otherKeys ?? []].flat(),
    });

    Reflect.defineMetadata(RoutesMetaKey, routes, target);
  };
};

function helperForRoutes(httpVerb: HttpVerb, options?: MethodOptions): MethodDecorator {
  let { prefix = '/' } = options ?? {};
  const { postfix = '', ctx } = options ?? {};

  return (target, propertyKey) => {
    if (typeof propertyKey === 'symbol') {
      throw new ServerError(`Method must be only string.`);
    }

    const routes: IRouteMap = Reflect.getOwnMetadata(RoutesMetaKey, target) ?? new Map();

    prefix = propertyKey.startsWith('/') ? '' : prefix;

    const routeConfig = routes.get(propertyKey) ?? {};
    const options: IRouteMetadata = {
      path: prefix + String(propertyKey) + postfix,
      requestMethod: httpVerb,
    };

    if (!_.isEmpty(ctx)) options['ctxKeys'] = ctx;

    routes.set(propertyKey, {
      ...routeConfig,
      ...options,
    });

    Reflect.defineMetadata(RoutesMetaKey, routes, target);
  };
}
