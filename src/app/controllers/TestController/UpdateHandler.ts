import express from 'express';

import RouteHandler, { IConfig, IMiddleware } from '../../core/RouteHandler';
import { ActionOptions, ValidateOptions } from '../../core/decorators';

export class Update extends RouteHandler {
  middleware: IMiddleware = [[express.json()], [express.json()]];
  config: IConfig = {
    ctx: ['db', 'events', 'sql'],
  };

  async action({ ctx, req, res, next }: ActionOptions<any, any>): Promise<void | Error> {
    console.log('ctx => ', ctx);

    ctx.events.push(async () => console.log('AFTER RESPONSE'));

    console.log('RESPONSE');

    await ctx.resolveEvents();

    res.send('Update!');
  }

  async validate({ yup, req, next }: ValidateOptions<any>): Promise<void | Error> {
    console.log('yup => ', yup);
    return Promise.resolve(undefined);
  }
}
