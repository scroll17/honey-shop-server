export * from './class';
export * from './method';
export * from './types';
export * from './middleware';

/**
 *    "emitDecoratorMetadata"
 *      "design:paramtypes" => types in the constructor (if we decorate the class itself)
 *      "design:type" => the type of the class property (if we decorate the property)
 *      "design:returntype" => the return type of the function (if we decorate the method)
 * */
