/*external modules*/
import { Handler } from 'express'
/*types*/
import {ClassMetaKey, RoutesMetaKey, IClassMetadata, ErrorMiddleware } from "./types";

/**
 *    "target" => class constructor
 *
 *    return => class constructor or null.
 *              If you return the constructor, it will replace the original one.
 *              Set up a prototype in a new constructor.
 * */

export function Controller(prefix = ''): ClassDecorator {
  return <T extends Function>(target: T) => {
    const metadata: IClassMetadata = Reflect.getOwnMetadata(ClassMetaKey, target) ?? {}

    if(!prefix.startsWith('/')) {
      prefix = `/${prefix}`
    }

    if(prefix.endsWith('/')) {
      prefix = prefix.slice(0, -1)
    }

    metadata['prefix'] = prefix;

    Reflect.defineMetadata(ClassMetaKey, metadata, target);

    // TODO
    // if (!Reflect.hasOwnMetadata(RoutesMetaKey, target)) {
    //   Reflect.defineMetadata(RoutesMetaKey, [], target);
    // }

    if (!Reflect.hasOwnMetadata('routes', target)) {
      Reflect.defineMetadata('routes', [], target);
    }
  };
}

export function ClassMiddleware(handlers: Array<Handler>): ClassDecorator {
  return <T extends Function>(target: T) => {
    const metadata: IClassMetadata = Reflect.getOwnMetadata(ClassMetaKey, target) ?? {};

    const handlerRecord = handlers.map(handler => ({ prefix: '', handler }));
    if(Reflect.has(metadata, 'handlers')) {
      metadata['handlers'] = metadata['handlers'].concat(handlerRecord)
    } else {
      metadata['handlers'] = handlerRecord
    }

    Reflect.defineMetadata(ClassMetaKey, metadata, target)
  };
}

export function SingleClassMiddleware(prefix: string | string[], handler: Handler): ClassDecorator {
  return <T extends Function>(target: T) => {
    const metadata: IClassMetadata = Reflect.getOwnMetadata(ClassMetaKey, target) ?? {};

    if(Reflect.has(metadata, 'handlers')) {
      metadata['handlers'] = [...metadata['handlers'], { prefix, handler }];
    } else {
      metadata['handlers'] = [{ prefix, handler }]
    }

    Reflect.defineMetadata(ClassMetaKey, metadata, target)
  };
}

export function ClassErrorMiddleware(errorHandler: ErrorMiddleware | ErrorMiddleware[]): ClassDecorator {
  return <T extends Function>(target: T) => {
    const metadata: IClassMetadata = Reflect.getOwnMetadata(ClassMetaKey, target) ?? {};
    metadata['errorHandlers'] = Array.isArray(errorHandler) ? errorHandler : [errorHandler];

    Reflect.defineMetadata(ClassMetaKey, metadata, target)
  };
}
