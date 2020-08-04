/*external modules*/
import { Handler } from 'express';
/*@core*/
import {
  ClassMetaKey,
  RoutesMetaKey,
  IClassMetadata,
  TErrorMiddleware,
  IRouteMap,
  IRouteMetadata,
} from './types';

export function ClassMiddleware(handlers: Array<Handler>): ClassDecorator {
  return (target) => {
    const metadata: IClassMetadata = Reflect.getOwnMetadata(ClassMetaKey, target) ?? {};

    const handlerRecord = handlers.map((handler) => ({ prefix: '', handler }));
    if (Reflect.has(metadata, 'handlers')) {
      metadata['handlers'] = metadata['handlers']!.concat(handlerRecord);
    } else {
      metadata['handlers'] = handlerRecord;
    }

    Reflect.defineMetadata(ClassMetaKey, metadata, target);
  };
}

export function SingleClassMiddleware(prefix: string | string[], handler: Handler): ClassDecorator {
  return (target) => {
    const metadata: IClassMetadata = Reflect.getOwnMetadata(ClassMetaKey, target) ?? {};

    if (Reflect.has(metadata, 'handlers')) {
      metadata['handlers'] = [...metadata['handlers']!, { prefix, handler }];
    } else {
      metadata['handlers'] = [{ prefix, handler }];
    }

    Reflect.defineMetadata(ClassMetaKey, metadata, target);
  };
}

export function ClassErrorMiddleware(errorHandler: TErrorMiddleware | TErrorMiddleware[]): ClassDecorator {
  return (target) => {
    const metadata: IClassMetadata = Reflect.getOwnMetadata(ClassMetaKey, target) ?? {};
    metadata['errorHandlers'] = Array.isArray(errorHandler) ? errorHandler : [errorHandler];

    Reflect.defineMetadata(ClassMetaKey, metadata, target);
  };
}

export function Middleware(beforeHandlers: Array<Handler>, afterHandlers: Array<Handler>): MethodDecorator {
  return (target, propertyKey) => {
    const routes: IRouteMap = Reflect.getOwnMetadata(RoutesMetaKey, target) ?? new Map();

    const routeConfig: IRouteMetadata = routes.get(propertyKey) ?? ({} as IRouteMetadata);
    routes.set(propertyKey, {
      ...routeConfig,
      middleware: [beforeHandlers, afterHandlers],
    });

    Reflect.defineMetadata(RoutesMetaKey, routes, target);
  };
}
