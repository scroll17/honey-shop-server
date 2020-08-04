/*external modules*/
import _ from 'lodash';
import * as importedYup from 'yup';
import assert from 'assert';
import mock from 'mock-require';
import originalExpress, { Express, Handler, RequestHandler, Router, RouterOptions } from 'express';
/*DB*/
import * as db from '../../../db';
import { sql } from '../../../db';
/*@core*/
import {
  ActionOptions,
  Controller,
  Get,
  HttpVerb,
  Path,
  ValidateOptions,
} from '../../../app/core/decorators';
import { authenticateHandler } from '../../../app/core/utils';
import { InjectRoute } from '../../../app/core/decorators/property';
import RouteHandler, { IConfig, IMiddleware } from '../../../app/core/RouteHandler';
/*other*/
import { ServerError } from '../../../app/error';
import { Test } from '../../helpres/Test';

let { applyControllers } = require('../../../app/core');

const AppRecord = new Map();
const RouterRecord = new Map();

const SymRouterOptions = Symbol('router-options');

const UpdateRouteMiddleware: IMiddleware = [[originalExpress.json()], [originalExpress.urlencoded()]];
export class Update extends RouteHandler {
  middleware: IMiddleware = UpdateRouteMiddleware;
  config: IConfig = {
    ctx: ['db', 'events', 'sql'],
    role: 'vendor',
  };

  async action({ ctx }: ActionOptions<any, any>): Promise<void | Error> {
    assert(_.isEqual(_.omit(ctx, 'resolveEvents'), { db, sql, events: [] }), 'Invalid route "ctx" object.');

    assert(
      _.isEqual(_.keys(ctx).sort(), ['db', 'sql', 'events', 'resolveEvents'].sort()),
      'Invalid route "ctx" keys.'
    );
  }

  validate({ yup }: ValidateOptions<any>): void {
    assert(_.isEqual(yup, importedYup), 'Invalid "yup" object.');
  }
}

let app: Express;

describe('src/app/core/core/property', () => {
  before(() => {
    const express = function express() {
      return originalExpress();
    };

    Reflect.set(express, 'Router', (options: RouterOptions) => {
      RouterRecord.set(SymRouterOptions, options);

      return new Proxy(originalExpress.Router(), {
        get(target: Router, p: PropertyKey): any {
          if (p === 'use') {
            return (prefix: string | RegExp, handler: Handler) => {
              RouterRecord.set(prefix, handler);
            };
          } else if (_.includes(_.values(HttpVerb), p)) {
            return (path: string, ...handlers: Array<RequestHandler>) => {
              RouterRecord.set(path, {
                method: p,
                handlers: handlers.flat(),
              });
            };
          } else {
            return Reflect.get(target, p);
          }
        },
      });
    });

    app = express();

    mock('express', express);

    ({ applyControllers } = mock.reRequire('../../../app/core'));
  });

  after(() => {
    mock.stopAll();
  });

  beforeEach(() => {
    RouterRecord.clear();
    AppRecord.clear();
  });

  // success
  it('@InjectRoute', () => {
    const path = '/update';
    const method = 'put';

    @Controller('/test')
    class TestController {
      @InjectRoute(method, path)
      ['update']: Update;
    }

    applyControllers(app, [TestController]);

    assert(RouterRecord.has(path), `Router not use path: "${path}"`);

    const {
      method: passedMethod,
      handlers: [
        beforeHandler,
        valHandler, // setLocHandler
        ,
        authHandler,
        targetHandler,
        afterHandler,
      ],
    } = RouterRecord.get(path);
    assert(passedMethod === method, 'Invalid route method.');

    const handlerInstance = new Update();

    assert(beforeHandler === handlerInstance.middleware![0][0], 'Invalid beforeHandler handler.');
    assert(authenticateHandler === authHandler, 'Invalid authenticate handler.');
    assert(afterHandler === handlerInstance.middleware![1][0], 'Invalid afterHandler handler.');

    valHandler({}, {}, () => {});
    targetHandler({}, {}, () => {});
  });

  // error
  it('IF not unique path', () => {
    @Controller('/test')
    class TestController {
      @Get()
      @Path('/create')
      create() {}

      @InjectRoute('get', '/create')
      update!: Update;
    }

    try {
      applyControllers(app, [TestController]);
    } catch (ex) {
      const pathToAdd = 'GET /create';

      Test.Check.error(
        ex,
        new ServerError(
          `In "${TestController.name}". "${pathToAdd}" already exist. Route must have a unique path.`
        )
      );
    }
  });
});
