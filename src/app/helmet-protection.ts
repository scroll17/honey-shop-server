import express from 'express';
import helmet from 'helmet';

export default (app: express.Application): void => {
  //app.use(helmet.contentSecurityPolicy()) // https://github.com/helmetjs/csp
  app.use(helmet.hidePoweredBy()); // https://github.com/helmetjs/hide-powered-by
  app.use(helmet.hsts()); // https://github.com/helmetjs/hsts
  app.use(helmet.ieNoOpen()); // https://github.com/helmetjs/ienoopen
  app.use(helmet.noCache()); // https://github.com/helmetjs/nocache
  app.use(helmet.frameguard()); // https://github.com/helmetjs/frameguard
  app.use(helmet.xssFilter()); // https://github.com/helmetjs/x-xss-protection
};
