/*external modules*/
import _ from 'lodash';
import yup from 'yup';
import { NextFunction, Request, RequestHandler, Response } from 'express';
/*DB*/
import * as db from '../../../db';
/*@core*/
import { IResLocals, IRouteMetadata, RouteContext, SymResLocals } from '../index';
/*other*/
import { ServerError } from '../../error';

export function setResLocals(options: IResLocals): RequestHandler {
  return (req, res, next) => {
    res.locals[SymResLocals] = options;
    next();
  };
}

export function createCtx(keys: Array<keyof RouteContext>, req: Request, res: Response, next: NextFunction) {
  const ctxKeys = new Set(keys);

  const ctx: Partial<RouteContext> = {};
  if (ctxKeys.has('events')) {
    ctx['events'] = [];
  }
  if (ctxKeys.has('sql')) {
    ctx['sql'] = db.sql;
  }
  if (ctxKeys.has('db')) {
    ctx['db'] = db;
  }
  if (ctxKeys.has('user')) {
    if (_.has(res.locals[SymResLocals], 'authUser')) {
    } else {
    }
    // TODO
    // ...
    next(new ServerError('problem '));
  }

  return ctx;
}

export const validateHandler: RequestHandler = (req, res, next) => {
  const { validateFunc }: Required<Pick<IRouteMetadata, 'validateFunc'>> = res.locals[SymResLocals];

  try {
    validateFunc(yup, req);
  } catch (ex) {
    //TODO ... rename reason or add Enum for core utils error
    next({ reason: 'YUP', error: ex });
  }
};

export const authenticateHandler: RequestHandler = (req, res, next) => {
  const { authRole }: Required<Pick<IRouteMetadata, 'authRole'>> = res.locals[SymResLocals];

  try {
    // TODO ...
    res.locals[SymResLocals]['authUser'] = ''; // TODO
  } catch (ex) {
    // TODO
    next({ reason: 'AUTH', error: ex });
  }
};
