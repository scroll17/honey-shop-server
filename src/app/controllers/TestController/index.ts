import 'reflect-metadata';
import {
  ClassMiddleware,
  Config,
  Controller,
  Ctx,
  Middleware,
  ActionOptions,
  Path,
  Validate,
} from '../../core';
import { Get, Post } from '../../core';

import express from 'express';

import logger from '../../../logger';
import { InjectRoute } from '../../core/decorators/property';
import { Update } from './UpdateHandler';

interface MethodsParam {
  findById: ActionOptions<'events' | 'sql', Record<string, never>, { id: string }>;
  create: ActionOptions<'events' | 'sql', { id: number }, { id: string }>;
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
  @Validate<MethodsParam['create']['req']>((yup, req) => {
    const {} = req.body;
  })
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
  //@Authenticate('vendor')
  @Ctx('events', 'db')
  @Path('/create/:id')
  @Middleware(
    [],
    [
      (req, res) => {
        console.log('-- NEXT HANDLER ---');
        res.send();
      },
    ]
  )
  create({ ctx, req, res, next }: MethodsParam['create']) {
    ctx.events.push();

    ctx.resolveEvents();

    console.log('ctx => ', ctx);
    console.log('req.params => ', req.params);

    return next();
  }

  @Post()
  @Config({
    path: '/invite/:id',
    ctx: ['db'],
    middleware: [[express.json()], [express.urlencoded()]],
    role: 'user',
    validate: (yup, req) => {},
  })
  invite() {}

  @InjectRoute('post', '/update/:id')
  update!: Update;
}

export default TestController;
