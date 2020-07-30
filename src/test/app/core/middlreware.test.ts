/*external modules*/
import _ from 'lodash';
import assert from 'assert';
import mock from 'mock-require';
import originalExpress, { Express, Handler, RequestHandler, Router, RouterOptions } from 'express';
/*DB*/
/*@core*/
import {
  ClassErrorMiddleware,
  ClassMiddleware,
  Controller,
  HttpVerb,
  Middleware,
  Post,
  SingleClassMiddleware,
} from '../../../app/core/decorators';
/*other*/
import { Test } from '../../helpres/Test';
import { ServerError } from '../../../app/error';

let { applyControllers } = require('../../../app/core');

const AppRecord = new Map();
const RouterRecord = new Map();

const SymRouterOptions = Symbol('router-options');

let app: Express;

describe('src/app/core/core/middleware', () => {
  before(() => {
    const express = function express() {
      return new Proxy(originalExpress(), {
        get(target: Express, p: PropertyKey): any {
          if (p === 'use') {
            return function (prefix: string | RegExp, handler: Handler) {
              AppRecord.set(prefix, handler);
            };
          } else {
            return Reflect.get(target, p);
          }
        },
      });
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
  it('@Middleware', () => {
    const path = '/create';

    const beforeHandler = () => {};
    const afterHandler = () => {};

    @Controller('/test')
    class TestController {
      @Post()
      @Middleware([beforeHandler], [afterHandler])
      [path]() {}
    }

    applyControllers(app, [TestController]);

    assert(RouterRecord.has(path), `Router not use path: "${path}"`);

    const {
      method,
      handlers: [bfHandler, , aftHandler],
    } = RouterRecord.get(path);
    assert(method === 'post', 'Invalid route method.');

    assert(beforeHandler === bfHandler, 'Invalid before handler.');
    assert(afterHandler === aftHandler, 'Invalid after handler.');
  });

  it('@ClassMiddleware', () => {
    const middleware = () => {};

    @Controller('/test')
    @ClassMiddleware([middleware])
    class TestController {}

    applyControllers(app, [TestController]);

    assert(RouterRecord.has(middleware), 'Router not use middleware');
  });

  it('@SingleClassMiddleware (with string prefix)', () => {
    const middleware = () => {};
    const prefix = 'findById';

    @Controller('/test')
    @SingleClassMiddleware(prefix, middleware)
    class TestController {}

    applyControllers(app, [TestController]);

    assert(RouterRecord.has(prefix), `Router not use middleware by prefix: "${prefix}"`);
    assert(
      RouterRecord.get(prefix) === middleware,
      `Router has invalid middleware: ${RouterRecord.get(prefix)}`
    );
  });

  it('@SingleClassMiddleware (with string array prefix)', () => {
    const middleware = () => {};
    const prefix = ['findById', 'findByEmail'];

    @Controller('/test')
    @SingleClassMiddleware(prefix, middleware)
    class TestController {}

    applyControllers(app, [TestController]);

    RouterRecord.forEach((value, key: RegExp) => {
      if (typeof key === 'symbol') return;

      assert(key.test(prefix[0]), `path ${prefix[0]} not supported in Router`);
      assert(key.test(prefix[1]), `path ${prefix[1]} not supported in Router`);

      assert(value === middleware, `Router has invalid middleware: ${value}`);
    });
  });

  it('@ClassErrorMiddleware', () => {
    const firstErrorHandler = () => {};
    const secondErrorHandler = () => {};

    @Controller('/test')
    @ClassErrorMiddleware([firstErrorHandler, secondErrorHandler])
    class TestController {}

    applyControllers(app, [TestController]);

    assert(AppRecord.has(firstErrorHandler), `App not use "${firstErrorHandler.name}"`);
    assert(AppRecord.has(secondErrorHandler), `App not use "${secondErrorHandler.name}"`);
  });

  // error
  it('IF Not have metadata', () => {
    class TestController {}

    try {
      applyControllers(app, [TestController]);
    } catch (ex) {
      Test.Check.error(
        ex,
        new ServerError(`"${TestController.name}" not have metadata. Use class decorators.`)
      );
    }
  });

  it('IF Not have prefix', () => {
    @ClassErrorMiddleware([])
    class TestController {}

    try {
      applyControllers(app, [TestController]);
    } catch (ex) {
      Test.Check.error(ex, new ServerError(`"${TestController.name}" not have prefix. Use @Controller.`));
    }
  });
});
