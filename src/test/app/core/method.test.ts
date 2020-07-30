/*external modules*/
import _ from 'lodash';
import assert from 'assert';
import mock from 'mock-require';
import originalExpress, { Express, Handler, RequestHandler, Router, RouterOptions } from 'express';
/*DB*/
import * as db from '../../../db';
import { sql } from '../../../db';
/*@core*/
import {
  Authenticate,
  Config,
  Controller,
  Ctx,
  Delete,
  Get,
  HttpVerb,
  IRouteConfig,
  Path,
  Post,
  Put,
  SymResLocals,
  Validate,
  ValidateCallback,
} from '../../../app/core/decorators';
import { authenticateHandler, validateHandler } from '../../../app/core/utils';
/*other*/
import { ServerError } from '../../../app/error';
import { Test } from '../../helpres/Test';

let { applyControllers } = require('../../../app/core');

const AppRecord = new Map();
const RouterRecord = new Map();

const SymRouterOptions = Symbol('router-options');

let app: Express;

describe('src/app/core/core/class', () => {
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
  it('@Method(HttpVerb)', () => {
    const methodName = 'create';
    const methodOptions = { prefix: '/:id/', postfix: '/:email' };

    const routeOptions = {
      req: {},
      res: {},
      next: () => {},
    };

    @Controller('/test')
    class TestController {
      @Get(methodOptions)
      [methodName]({ req, res, next }: Record<string, any>) {
        assert(_.isEqual(req, routeOptions.req), 'Invalid route "req" option.');
        assert(_.isEqual(res, routeOptions.res), 'Invalid route "res" option.');
        assert(_.isEqual(next, routeOptions.next), 'Invalid route "next" option.');
      }
    }

    applyControllers(app, [TestController]);

    const path = methodOptions.prefix + methodName + methodOptions.postfix;
    assert(RouterRecord.has(path), 'Decorator not generate path for route.');

    const {
      method,
      handlers: [targetHandler],
    } = RouterRecord.get(path);
    assert(method === 'get', 'Invalid route method.');
    assert(targetHandler, 'Not found target route handler.');

    targetHandler(routeOptions.req, routeOptions.res, routeOptions.next);
  });

  it('@Ctx', () => {
    const ctxKeys: any[] = ['db', 'events'];
    const methodName = '/create';

    @Controller('/test')
    class TestController {
      @Post()
      @Ctx(ctxKeys, 'sql')
      [methodName]({ ctx }: Record<string, any>) {
        assert(
          _.isEqual(ctx, {
            sql,
            db,
            events: [],
          }),
          'Invalid route "ctx" option.'
        );
      }
    }

    applyControllers(app, [TestController]);

    assert(RouterRecord.has(methodName), 'Decorator not generate path for route.');

    const {
      method,
      handlers: [targetHandler],
    } = RouterRecord.get(methodName);
    assert(method === 'post', 'Invalid route method.');
    assert(targetHandler, 'Not found target route handler.');

    targetHandler({}, {}, () => {});
  });

  it('@Path', () => {
    const path = '/create/:id';

    @Controller('/test')
    class TestController {
      @Get()
      @Path(path)
      create() {}
    }

    applyControllers(app, [TestController]);

    assert(RouterRecord.has(path), 'Decorator not use custom path for route.');
  });

  it('@Authenticate / @Validate', () => {
    const path = '/delete/:id';

    const authRole = 'vendor';
    const validateFunc: ValidateCallback<any> = (yup, req) => {
      assert(yup && req, 'Invalid params in validate callback.');
    };

    @Controller('/test')
    class TestController {
      @Delete()
      @Authenticate(authRole)
      @Validate(validateFunc)
      [path]() {}
    }

    applyControllers(app, [TestController]);

    assert(RouterRecord.has(path), `Router not use path: "${path}"`);

    const {
      method,
      handlers: [setLocHandler, valHandler, authHandler],
    } = RouterRecord.get(path);
    assert(method === 'delete', 'Invalid route method.');

    assert(authenticateHandler === authHandler, 'Invalid authenticate handler.');
    assert(validateHandler === valHandler, 'Invalid validate handler.');

    let callNext = false;
    const next = () => (callNext = true);

    const res: Record<string | symbol, any> = { locals: {} };
    setLocHandler({}, res, next);

    assert(callNext, 'Next function was not called.');
    assert(
      _.isEqual(res.locals[SymResLocals], {
        authRole,
        validateFunc: validateFunc,
      }),
      'Invalid res.locals[SymResLocals] options'
    );
  });

  it('@Config', () => {
    const configOptions: IRouteConfig = {
      path: 'config',
      role: 'admin',
      ctx: ['sql', 'events'],
      validate: (yup, req) => assert(yup && req, 'Invalid params in validate callback.'),
      middleware: [[originalExpress.json()], [originalExpress.urlencoded()]],
    };

    @Controller('/test')
    class TestController {
      @Put()
      @Config(configOptions)
      [configOptions.path as string]({ ctx }: Record<string, any>) {
        assert(
          _.isEqual(ctx, {
            sql,
            events: [],
          }),
          'Invalid route "ctx" option.'
        );
      }
    }

    applyControllers(app, [TestController]);

    assert(RouterRecord.has(configOptions.path), `Router not use path: "${configOptions.path}"`);

    const {
      method,
      handlers: [
        beforeHandler, // setLocHandler
        ,
        valHandler,
        authHandler,
        targetHandler,
        afterHandler,
      ],
    } = RouterRecord.get(configOptions.path);
    assert(method === 'put', 'Invalid route method.');

    assert(beforeHandler === configOptions.middleware![0][0], 'Invalid beforeHandler handler.');
    assert(authenticateHandler === authHandler, 'Invalid authenticate handler.');
    assert(validateHandler === valHandler, 'Invalid validate handler.');
    assert(afterHandler === configOptions.middleware![1][0], 'Invalid beforeHandler handler.');

    targetHandler({}, {}, () => {});
  });

  // error
  it('IF not unique path', () => {
    @Controller('/test')
    class TestController {
      @Get()
      @Path('/create')
      create() {}

      @Get()
      @Path('/create')
      create2() {}
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

  it('IF request method no exist', () => {
    @Controller('/test')
    class TestController {
      @Ctx('db')
      @Path('/create')
      create() {}
    }

    try {
      applyControllers(app, [TestController]);
    } catch (ex) {
      Test.Check.error(
        ex,
        new ServerError(
          `In "${TestController.name}". Route must have a request method. Use @Method(HttpVerb).`
        )
      );
    }
  });

  it('IF path no exist', () => {
    @Controller('/test')
    class TestController {
      @Ctx('db')
      create() {}
    }

    try {
      applyControllers(app, [TestController]);
    } catch (ex) {
      Test.Check.error(
        ex,
        new ServerError(
          `In "${TestController.name}". Route must have a path. Use @Path or @Method(HttpVerb).`
        )
      );
    }
  });
});
