/*external modules*/
import { RouterOptions } from 'express';
/*@core*/
import { ClassMetaKey, RoutesMetaKey, IClassMetadata, PropRoutesMetaKey } from './types';

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

    if (!Reflect.hasOwnMetadata(RoutesMetaKey, target.prototype)) {
      Reflect.defineMetadata(RoutesMetaKey, new Map(), target.prototype);
    }

    if (!Reflect.hasOwnMetadata(PropRoutesMetaKey, target.prototype)) {
      Reflect.defineMetadata(PropRoutesMetaKey, new Map(), target.prototype);
    }
  };
}
