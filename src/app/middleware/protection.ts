/*external modules*/
import express from 'express';
import helmet from 'helmet';
import nocache from 'nocache';
import csurf from 'csurf';
/*other*/
import { config } from '../../config';

export default (app: express.Application): void => {
  //app.use(helmet.contentSecurityPolicy()) // https://github.com/helmetjs/csp
  app.use(helmet.hsts()); // https://github.com/helmetjs/hsts
  app.use(helmet.ieNoOpen()); // https://github.com/helmetjs/ienoopen
  app.use(helmet.frameguard()); // https://github.com/helmetjs/frameguard
  app.use(helmet.xssFilter()); // https://github.com/helmetjs/x-xss-protection

  app.use(nocache()); // https://github.com/helmetjs/nocache

  // https://github.com/expressjs/csurf
  app.use(
    csurf({
      cookie: config.http.csrf,
      value: (req) => req.get('csrf-token')!,
    })
  );
};
