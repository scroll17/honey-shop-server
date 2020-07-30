/*external modules*/
import { ErrorRequestHandler, Handler, NextFunction, Request, Response, RouterOptions } from 'express';
import Yup from 'yup';
/*@core*/
import { RouteContext } from '../index';
import { UserRole } from '../../../db/types/user';

/** CLASS */
export const ClassMetaKey = Symbol('meta-class');

export interface IClass<T = any, A extends Array<any> = any[]> extends Function {
  new (...args: A): T;
}

export interface IClassMetadata {
  prefix: string;
  handlers: Array<{ prefix: string | string[]; handler: Handler }>;
  errorHandlers: TErrorMiddleware[];
  routerOptions: RouterOptions;
}

/** METHOD */
export const RoutesMetaKey = Symbol('meta-routes');
export const SymCustomPath = Symbol('custom-path');

type ReqBody = any;
type ResBody = any;
type ReqQuery = { [key: string]: undefined | string | string[] | ReqQuery | ReqQuery[] };
type ReqParams = string[] | { [key: string]: string };

type CtxKeys = keyof RouteContext;

export type ParamsInMethod<
  TCtxKeys extends keyof RouteContext,
  TBody extends ReqBody,
  TParams extends ReqParams = Record<string, any>,
  TQuery extends ReqQuery = Record<string, any>
> = {
  ctx: Pick<RouteContext, TCtxKeys>;
  req: Request<TParams, ResBody, TBody, TQuery>;
  res: Response;
  next: NextFunction;
};

export interface MethodOptions {
  prefix?: string;
  postfix?: string;
  ctx?: Array<CtxKeys>;
}

export interface IRouteMetadata {
  path: string | RegExp;
  requestMethod: HttpVerb;
  ctxKeys?: Array<CtxKeys>;
  validateFunc?: ValidateCallback<Request | any>;
  middleware?: [Array<Handler>, Array<Handler>];
  authRole?: UserRole;
  [SymCustomPath]?: string | RegExp;
}

export interface IRouteConfig {
  path?: string | RegExp;
  ctx?: Array<CtxKeys>;
  validate?: ValidateCallback<Request | any>;
  middleware?: [Array<Handler>, Array<Handler>];
  role?: UserRole;
}

export interface IResLocals {
  validateFunc?: ValidateCallback<Request | any>;
  authRole?: UserRole;
}

export type IRouteMap = Map<string | symbol, IRouteMetadata>;

export type ValidateCallback<TReq extends Request> = (yup: typeof Yup, req: TReq) => void;

export type CtxMethodDecorator = (
  keys: CtxKeys | Array<CtxKeys>,
  ...otherKeys: Array<CtxKeys>
) => MethodDecorator;

export type HttpMethodDecorator = (options?: MethodOptions) => MethodDecorator;

/** PROPERTY */

/** OTHER */
export const SymResLocals = Symbol('res-locals');

export type TErrorMiddleware = ErrorRequestHandler;

export enum HttpVerb {
  GET = 'get',
  HEAD = 'head',
  POST = 'post',
  PUT = 'put',
  DELETE = 'delete',
  OPTIONS = 'options',
}
