/*external modules*/
import assert from 'assert';
import mock from 'mock-require';
import originalExpress, {Express, Handler, Router} from 'express'
/*DB*/
/*@core*/
import {ClassErrorMiddleware, ClassMiddleware, Controller, SingleClassMiddleware} from "../../../app/core/decorators";
/*other*/

let { applyControllers } = require("../../../app/core")

const AppRecord = new Map();
const RouterRecord = new Map()

let app: Express

describe('src/app/core/decorators/class', () => {
  before(() => {
    const express = function express() {
      return new Proxy(originalExpress(), {
        get(target: Express, p: PropertyKey): any {
          if(p === 'use') {
            return function (prefix: string | RegExp, handler: Handler) {
              AppRecord.set(prefix, handler)
            }
          } else {
            return Reflect.get(target, p)
          }
        }
      })
    } as any

    Reflect.set(express, 'Router', () => {
      return new Proxy(originalExpress.Router(), {
        get(target: Router, p: PropertyKey): any {
          if(p === 'use') {
            return function (prefix: string | RegExp, handler: Handler) {
              RouterRecord.set(prefix, handler)
            }
          } else {
            return Reflect.get(target, p)
          }
        }
      })
    })

    app = express()

    mock('express', express);

    ({ applyControllers } = mock.reRequire('../../../app/core'))
  })

  after(() => {
    mock.stopAll()
  })

  beforeEach(() => {
    RouterRecord.clear()
    AppRecord.clear()
  })

  it('@Controller', () => {
    const prefix = '/test';
    @Controller(prefix)
    class TestController {

    }

    applyControllers(app, [TestController])

    assert(
      [...AppRecord.keys()].includes(prefix),
      `App not use Router by prefix: "${prefix}"`
    )
  })

  it('@ClassMiddleware', () => {
    const middleware = () => {}

    @Controller('/test')
    @ClassMiddleware([middleware])
    class TestController {

    }

    applyControllers(app, [TestController])

    assert(RouterRecord.has(middleware), 'Router not use middleware')
  })

  it('@SingleClassMiddleware (with string prefix)', () => {
    const middleware = () => {}
    const prefix = 'findById';

    @Controller('/test')
    @SingleClassMiddleware(prefix, middleware)
    class TestController {

    }

    applyControllers(app, [TestController])

    assert(RouterRecord.has(prefix), `Router not use middleware by prefix: "${prefix}"`)
    assert(RouterRecord.get(prefix) === middleware, `Router has invalid middleware: ${RouterRecord.get(prefix)}`)
  })

  it('@SingleClassMiddleware (with string array prefix)', () => {
    const middleware = () => {}
    const prefix = ['findById', 'findByEmail'];

    @Controller('/test')
    @SingleClassMiddleware(prefix, middleware)
    class TestController {

    }

    applyControllers(app, [TestController])


    RouterRecord.forEach((value, key: RegExp) => {
      assert(key.test(prefix[0]), `path ${prefix[0]} not supported in Router`)
      assert(key.test(prefix[1]), `path ${prefix[1]} not supported in Router`)

      assert(value === middleware, `Router has invalid middleware: ${value}`)
    })
  })

  it('@ClassErrorMiddleware', () => {
    const firstErrorHandler = () => {}
    const secondErrorHandler = () => {}

    @Controller('/test')
    @ClassErrorMiddleware([firstErrorHandler, secondErrorHandler])
    class TestController {

    }

    applyControllers(app, [TestController])

    assert(AppRecord.has(firstErrorHandler), `App not use "${firstErrorHandler.name}"`)
    assert(AppRecord.has(secondErrorHandler), `App not use "${secondErrorHandler.name}"`)
  })
})
