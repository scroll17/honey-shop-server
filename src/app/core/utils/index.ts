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

export function createCtx(
  keys: Array<keyof RouteContext>,
  req: Request,
  res: Response,
  next: NextFunction
): Partial<RouteContext> {
  const ctxKeys = new Set(keys);

  const ctx: Partial<RouteContext> = {};

  // events
  if (ctxKeys.has('events')) {
    ctx['events'] = [];
    ctx['resolveEvents'] = async () => {
      if (!ctx.events) return;
      await Promise.all(ctx.events.map((event) => event()));
    };
  }

  // sql
  if (ctxKeys.has('sql')) {
    ctx['sql'] = db.sql;
  }

  // db
  if (ctxKeys.has('db')) {
    ctx['db'] = db;
  }

  // user
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

export const authorizationHandler: RequestHandler = (req, res, next) => {
  const { authRole }: Required<Pick<IRouteMetadata, 'authRole'>> = res.locals[SymResLocals];

  try {
    // TODO ...
    res.locals[SymResLocals]['authUser'] = authRole; // TODO
  } catch (ex) {
    // TODO
    next({ reason: 'AUTH', error: ex });
  }
};
