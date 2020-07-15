import {ErrorRequestHandler, Handler, RequestHandler} from "express";

/** CLASS */
export interface IClass<T = any, A extends any[] = any[]> extends Function { new(...args: A): T; }

export interface IClassMetadata {
  prefix: string;
  handlers: Array<{ prefix: string | string[], handler: Handler }>;
  errorHandlers: ErrorMiddleware[];
}

export const ClassMetaKey = Symbol('meta-class');

/** METHOD */
export interface IRouteMetadata {
  path: string;
  requestMethod: HttpVerb;
  methodName: string;
}

export const RoutesMetaKey = Symbol('meta-routes')

/** OTHER */
export type Middleware = RequestHandler;
export type ErrorMiddleware = ErrorRequestHandler;

export enum HttpVerb {
  GET = 'get',
  HEAD = 'head',
  POST = 'post',
  PUT = 'put',
  DELETE = 'delete',
  OPTIONS = 'options'
}
