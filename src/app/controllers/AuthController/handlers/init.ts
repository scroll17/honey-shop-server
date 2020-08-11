/*external modules*/
import express from 'express';
/*@core*/
import RouteHandler, {IConfig, IMiddleware} from "../../../core/RouteHandler";
import {ActionOptions, ValidateOptions} from "../../../core/decorators";
/*middleware*/
import { custCsurf } from "../../../middleware/csurf";
import cookieParser from "../../../middleware/cookieParser";
/*other*/

export class Init extends RouteHandler {
  middleware: IMiddleware = [
    [cookieParser, custCsurf(['post'])],
    []
  ];
  config: IConfig = {
    ctx: ['db', 'sql', 'events']
  };

  async validate({ yup, req, next }: ValidateOptions<any>): Promise<void | Error> {
    try {
      next()
    } catch (error) {

    }
  }

  async action({ ctx, req, res, next }: ActionOptions<any, any>): Promise<void | Error> {
    try {
      const csrf = req.csrfToken();

      res.send({ csrf })
    } catch (error) {

    }
  }
}
