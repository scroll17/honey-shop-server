import express from 'express';
import helmet from 'helmet';
import nocache from 'nocache';

export default (app: express.Application): void => {
  //app.use(helmet.contentSecurityPolicy()) // https://github.com/helmetjs/csp
  app.use(helmet.hsts()); // https://github.com/helmetjs/hsts
  app.use(helmet.ieNoOpen()); // https://github.com/helmetjs/ienoopen
  app.use(helmet.frameguard()); // https://github.com/helmetjs/frameguard
  app.use(helmet.xssFilter()); // https://github.com/helmetjs/x-xss-protection

  app.use(nocache()); // https://github.com/helmetjs/nocache
};
