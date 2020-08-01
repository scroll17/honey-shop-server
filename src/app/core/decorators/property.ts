/*external modules*/
/*@core*/
import { InjectMethodDecorator, PropRoutesMetaKey, IPopRouteMap, HttpVerb } from './types';
import RouteHandler from '../../RouteHandler';
/*other*/
import { ServerError } from '../../error';

/**
 *    "target" => class constructor (if static) / class.prototype
 *    "propertyKey" => key name
 *
 *    return => null or a descriptor to a property; if a descriptor is returned, it will be used to call Object.defineProperty;
 * */

export const InjectRoute: InjectMethodDecorator = (method, path): PropertyDecorator => {
  return (target, propertyKey) => {
    const routes: IPopRouteMap = Reflect.getOwnMetadata(PropRoutesMetaKey, target) ?? new Map();

    const handlerType = Reflect.getOwnMetadata('design:type', target, propertyKey);
    if (Object.getPrototypeOf(handlerType) !== RouteHandler) {
      throw new ServerError('Injected route must be extends from RouteHandler.');
    }

    routes.set(propertyKey, {
      requestMethod: method as HttpVerb,
      path,
      handlerType,
    });

    Reflect.defineMetadata(PropRoutesMetaKey, routes, target);
  };
};
