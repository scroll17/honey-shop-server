/*external modules*/
import _ from 'lodash';
import assert from 'assert';
import mock from 'mock-require';
import originalExpress, { Express, Handler, RequestHandler, Router, RouterOptions } from 'express';
/*DB*/
/*@core*/
import {
  Child,
  ChildControllers,
  ChildMetaKey,
  Controller,
  HttpVerb,
  Post,
} from '../../../app/core/decorators';
/*other*/
import { Test } from '../../helpres/Test';
import { ServerError } from '../../../app/error';

let { applyControllers } = require('../../../app/core');

const AppRecord = new Map();
const RouterRecord = new Map();

const SymRouterOptions = Symbol('router-options');

let app: Express;

describe('src/app/core/core/class', () => {
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

    Reflect.set(express, 'Router', function router(options: RouterOptions) {
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
  it('@Controller', () => {
    const prefix = '/test';
    const options: RouterOptions = {
      caseSensitive: true,
      mergeParams: true,
      strict: false,
    };

    @Controller(prefix, options)
    class TestController {}

    applyControllers(app, [TestController]);

    assert(AppRecord.has(prefix), `App not use Router by prefix: "${prefix}"`);
    assert(RouterRecord.get(SymRouterOptions) === options, `Router has invalid options`);
  });

  it('@Child', () => {
    const options: RouterOptions = {
      caseSensitive: true,
      mergeParams: true,
      strict: false,
    };

    @Child(options)
    class TestController {}

    assert(options === Reflect.getOwnMetadata(ChildMetaKey, TestController), 'Not found child options.');
  });

  it('@ChildControllers', () => {
    const prefix = '/test';

    const childPrefix = '/auth';
    const methodName = '/sing';

    @Child()
    class TestAuthController {
      @Post()
      [methodName]() {}
    }

    @Controller(prefix)
    @ChildControllers([[childPrefix, TestAuthController]])
    class TestController {}

    applyControllers(app, [TestController]);

    assert(AppRecord.has(prefix), `App not use Router by prefix: "${prefix}".`);

    assert(RouterRecord.has(childPrefix), 'Router not use child controller.');
    assert(
      RouterRecord.get(childPrefix).name === originalExpress.Router().name,
      'Router use invalid child controller.'
    );

    assert(RouterRecord.has(methodName), `Router not use route by path "${methodName}".`);
    assert(
      RouterRecord.get(methodName).method === 'post',
      `Invalid method in route by path "${methodName}".`
    );
    assert(
      !_.isEmpty(RouterRecord.get(methodName).handlers),
      `Handlers must have not empty by path "${methodName}".`
    );
  });

  //error
  it('IF child controllers not use @Child', () => {
    try {
      class TestAuthController {}

      @Controller('/test')
      @ChildControllers([['auth', TestAuthController]])
      class TestController {}
    } catch (ex) {
      Test.Check.error(ex, new ServerError(`Child controller must have use @Child.`));
    }
  });
});
