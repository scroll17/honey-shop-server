/*external modules*/
import { ErrorRequestHandler, Handler, NextFunction, Request, Response, RouterOptions } from 'express';
import * as Yup from 'yup';
/*DB*/
import { UserRole } from '../../../db/types/user';
/*@core*/
import { TArray } from '@honey/types';
import { RouteContext } from '../index';

/** CLASS */
export const ClassMetaKey = Symbol('meta-class');
export const ChildMetaKey = Symbol('child-meta-class');

export interface IClass<T = any, A extends Array<any> = any[]> extends Function {
  new (...args: A): T;
}

export interface IClassMetadata {
  prefix: string;
  handlers?: Array<{ prefix: string | string[]; handler: Handler }>;
  errorHandlers?: TErrorMiddleware[];
  routerOptions?: RouterOptions;
  children?: Map<string, IClass>;
}

export type ChildControllerDecorator = (controllers: TArray.Pairs<string, IClass>) => ClassDecorator;

/** METHOD */
export const RoutesMetaKey = Symbol('meta-routes');
export const SymCustomPath = Symbol('custom-path');

type ReqBody = any;
type ResBody = any;
type ReqQuery = { [key: string]: undefined | string | string[] | ReqQuery | ReqQuery[] };
type ReqParams = string[] | { [key: string]: string };

type CtxKeys = keyof RouteContext;

export type ActionOptions<
  TCtxKeys extends keyof RouteContext,
  TBody extends ReqBody,
  TParams extends ReqParams = Record<string, any>,
  TQuery extends ReqQuery = Record<string, any>
> = {
  ctx: Pick<RouteContext, TCtxKeys extends 'events' ? TCtxKeys | 'resolveEvents' : TCtxKeys>;
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
export const PropRoutesMetaKey = Symbol('property-meta-routes');

export type InjectMethodDecorator = (method: string | HttpVerb, path: string | RegExp) => PropertyDecorator;

export interface IPropRouteMetadata {
  path: string | RegExp;
  requestMethod: HttpVerb;
  handlerType: IClass;
}

export type IPopRouteMap = Map<string | symbol, IPropRouteMetadata>;

export interface IRouteHandlerConfig {
  role?: UserRole;
  ctx?: Array<CtxKeys>;
}

/** ROUTE HANDLER */

export type ValidateOptions<
  TBody extends ReqBody,
  TParams extends ReqParams = Record<string, any>,
  TQuery extends ReqQuery = Record<string, any>
> = {
  req: Request<TParams, ResBody, TBody, TQuery>;
  next: NextFunction;
  yup: typeof Yup;
};

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
