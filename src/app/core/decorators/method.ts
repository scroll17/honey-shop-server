import { RouteContext } from "../index";


/**
 *    "target" => class constructor (if static) / class.prototype
 *    "propertyKey" => key name
 *    "descriptor" => descriptor property key
 *
 *    return => If the method decorator returns a value, that value will be used as a Property Descriptor for the method.
 * */

// export const Get: MethodDecorator = (target, propertyKey, descriptor) => {
//   // `target` equals our class, `propertyKey` equals our decorated method name
//   return (target, propertyKey: string): void => {
//     // In case this is the first route to be registered the `routes` metadata is likely to be undefined at this point.
//     // To prevent any further validation simply set it to an empty array here.
//     if (!Reflect.hasMetadata('routes', target.constructor)) {
//       Reflect.defineMetadata('routes', [], target.constructor);
//     }
//
//     // Get the routes stored so far, extend it by the new route and re-set the metadata.
//     const routes = Reflect.getMetadata('routes', target.constructor) as Array<RouteDefinition>;
//
//     routes.push({
//       requestMethod: 'get',
//       path,
//       methodName: propertyKey
//     });
//     Reflect.defineMetadata('routes', routes, target.constructor);
//   }
// }

interface MethodConfig {
  prefix?: string;
  postfix?: string;
  ctx?: Array<Omit<keyof RouteContext, 'db'>>
}

export const Get = ({ prefix = '/', postfix = '', ctx = ['db'] }: MethodConfig): MethodDecorator => {
  return (target, propertyKey) => {
    if (! Reflect.hasMetadata('routes', target.constructor)) {
      Reflect.defineMetadata('routes', [], target.constructor);
    }

    const routes = Reflect.getMetadata('routes', target.constructor);

    routes.push({
      requestMethod: 'get',
      path: prefix + String(propertyKey) + postfix,
      methodName: propertyKey
    });
    Reflect.defineMetadata('routes', routes, target.constructor);
  };
};
