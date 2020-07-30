import {
  Authenticate,
  ClassMiddleware,
  Config,
  Controller,
  Ctx,
  Middleware,
  ParamsInMethod,
  Path,
  Validate,
} from '../core';
import { Get, Post } from '../core';

import express from 'express';

import logger from '../../logger';

interface MethodsParam {
  findById: ParamsInMethod<'events' | 'sql', Record<string, never>, { id: string }>;
  create: ParamsInMethod<'events' | 'sql', { id: number }, { id: string }>;
}

@Controller('/test', { mergeParams: true })
@ClassMiddleware([express.json({ strict: true })])
class TestController {
  @Get({ postfix: '/:id', ctx: ['events', 'sql'] })
  async findById({ ctx, req, res, next }: MethodsParam['findById']) {
    console.log('ctx => ', ctx);

    try {
      const { body, params } = req;

      logger.info('body', body);
      logger.info('params', params);

      if (Number(params.id) > 10) {
        throw new Error(`ID > 10`);
      }

      return res.send({ body, params });
    } catch (ex) {
      logger.error('in TestController/findById', ex);
      next(ex);
    }
  }

  @Get({ postfix: '/:id', ctx: ['events', 'sql'] })
  async findById2({ ctx, req, res, next }: MethodsParam['findById']) {
    console.log('ctx => ', ctx);

    try {
      const { body, params } = req;

      logger.info('body', body);
      logger.info('params', params);

      if (Number(params.id) > 10) {
        throw new Error(`ID > 10`);
      }

      return res.send({ body, params });
    } catch (ex) {
      logger.error('in TestController/findById', ex);
      next(ex);
    }
  }

  @Post()
  @Authenticate('vendor')
  @Ctx('sql', 'db')
  @Path('/create/:id')
  @Middleware([express.json()], [express.urlencoded()])
  @Validate<MethodsParam['create']['req']>((yup, req) => {
    const {} = req.body;

    const schema = {
      name: yup.string(),
    };
  })
  @Middleware([], [])
  create({ ctx, req, res, next }: MethodsParam['create']) {
    console.log('ctx => ', ctx);
    res.send('OK');
  }

  @Post()
  @Config({
    path: 'invite/:id',
    ctx: ['db'],
    middleware: [[express.json()], [express.urlencoded()]],
    role: 'user',
    validate: (yup, req) => {},
  })
  invite() {}
  // @InjectRouteHandler({
  //   method: 'get',
  //   path: '/update',
  //   auth: '',              // ?
  //   ctx: ['db'],           // ?
  //   middleware: [ [], [] ] // ?
  // })
  // update: 'class {}'
}

export default TestController;

// @Controller('user')
// class UserController {
//
//   @Post
//   @Autentificate('user' | 'vendor' | 'admin')
//   @Middleware([], [])
//   @Validate((yup, req) => {
//     const { body } = req;
//
//     const schema = {
//       name: yup.string()
//     }
//   })
//   create(req, res, next) {
//
//   }
//
//   @Get({ postfix: '/:file' })
//  @Middleware([], []);
//   @BeforeMiddlerware()
//   @AfterMiddlerware(express.static('/fo'))
//   get(){
//
//   }
//
//   @Post
//   @InjectRouteController
//   update!: DeleteController
// }
