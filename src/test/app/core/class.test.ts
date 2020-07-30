/*external modules*/
import assert from 'assert';
import mock from 'mock-require';
import originalExpress, { Express, Handler, Router, RouterOptions } from 'express';
/*DB*/
/*@core*/
import { Controller } from '../../../app/core/decorators';
/*other*/

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

    Reflect.set(express, 'Router', (options: RouterOptions) => {
      RouterRecord.set(SymRouterOptions, options);

      return new Proxy(originalExpress.Router(), {
        get(target: Router, p: PropertyKey): any {
          if (p === 'use') {
            return function (prefix: string | RegExp, handler: Handler) {
              RouterRecord.set(prefix, handler);
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
});
