/*external modules*/
import { RouterOptions } from 'express';
/*@core*/
import {
  ClassMetaKey,
  RoutesMetaKey,
  IClassMetadata,
  PropRoutesMetaKey,
  ChildControllerDecorator,
  ChildMetaKey,
} from './types';
/*other*/
import { ServerError } from '../../error';

/**
 *    "target" => class constructor
 *
 *    return => class constructor or null.
 *              If you return the constructor, it will replace the original one.
 *              Set up a prototype in a new constructor.
 * */

export function Controller(prefix: string, options?: RouterOptions): ClassDecorator {
  return (target) => {
    const metadata: IClassMetadata = Reflect.getOwnMetadata(ClassMetaKey, target) ?? {};

    metadata['prefix'] = prefix;
    metadata['routerOptions'] = options ?? {};

    Reflect.defineMetadata(ClassMetaKey, metadata, target);

    defineDefaultRoutes(target);
  };
}

export const ChildControllers: ChildControllerDecorator = (controllers) => {
  return (target) => {
    const controllersMap = new Map(controllers);
    controllersMap.forEach((value) => {
      if (!Reflect.hasOwnMetadata(ChildMetaKey, value)) {
        throw new ServerError(`Child controller must have use @Child.`);
      }
    });

    const metadata: IClassMetadata = Reflect.getOwnMetadata(ClassMetaKey, target) ?? {};

    metadata['children'] = controllersMap;

    Reflect.defineMetadata(ClassMetaKey, metadata, target);
  };
};

export function Child(options?: RouterOptions): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(ChildMetaKey, options ?? {}, target);

    if (!Reflect.hasOwnMetadata(ClassMetaKey, target)) {
      Reflect.defineMetadata(ClassMetaKey, {}, target);
    }

    defineDefaultRoutes(target);
  };
}

function defineDefaultRoutes<T extends Function>(target: T) {
  if (!Reflect.hasOwnMetadata(RoutesMetaKey, target.prototype)) {
    Reflect.defineMetadata(RoutesMetaKey, new Map(), target.prototype);
  }

  if (!Reflect.hasOwnMetadata(PropRoutesMetaKey, target.prototype)) {
    Reflect.defineMetadata(PropRoutesMetaKey, new Map(), target.prototype);
  }
}
