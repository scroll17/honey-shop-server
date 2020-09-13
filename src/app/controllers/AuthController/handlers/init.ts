/*external modules*/
import express from 'express';
/*@core*/
import RouteHandler, { IConfig, IMiddleware } from '../../../core/RouteHandler';
import { ActionOptions, ValidateOptions } from '../../../core/decorators';
/*middleware*/
import cookieParser from '../../../middleware/cookieParser';
/*other*/

export class Init extends RouteHandler {
  middleware: IMiddleware = [[cookieParser], []];
  config: IConfig = {
    ctx: ['db', 'sql', 'events'],
  };

  async validate({ yup, req, next }: ValidateOptions<any>): Promise<void | Error> {
    console.log('COOKIE => ', req.cookies);

    try {
      next();
    } catch (error) {}
  }

  async action({ ctx, req, res, next }: ActionOptions<any, any>): Promise<void | Error> {
    try {
      //const csrf = req.csrfToken();

      res.cookie('test_g', 'val', { maxAge: 1000 });

      res.send({});

      //res.send({ csrf });
    } catch (error) {}
  }
}
