/**
 *    "target" => class constructor (if static) / class.prototype
 *    "propertyKey" => key name
 *
 *    return => null or a descriptor to a property; if a descriptor is returned, it will be used to call Object.defineProperty;
 * */

export function InjectRouteHandler<T>(target: Object, propertyKey: string | symbol): any {
  return {

  }
}
