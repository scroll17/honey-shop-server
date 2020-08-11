/*external modules*/
import express from 'express';
/*middleware*/
import protectionMiddleware from './middleware/protection';
import errorHandlers from './middleware/errorHandlers';
import { expressLogger } from './middleware/logger';
/*controllers*/
import ServiceController from './controllers';
/*other*/
import { config } from '../config';

export default async function init(): Promise<express.Application> {
  const app: express.Application = express();

  app.set('port', config.http.port);
  app.set('trust proxy', config.http.trustProxy);

  app.disable('x-powered-by');

  app.use('/static/images', express.static(config.public.images, { maxAge: '7d' }));
  app.use('/static/files', express.static(config.public.files, { maxAge: '7d' }));

  app.use(expressLogger);
  app.use(protectionMiddleware());

  if(config.name === 'development') ServiceController.createStatistic(true);

  await ServiceController.setupControllers(app);

  app.use(errorHandlers);

  return app;
}

// import { Application } from 'express';
// import app from '../index';
//
// export function applyControllers(app: Application, controllers: Array<any>) {}
//
// // TODO
// app.get('/', (req, res) => {
//   res.send({ csrfToken: req.csrfToken() });
// });

// app.post('/post', (req, res) => {
//   console.log('headers => ', req.headers)
//   res.send({ type: 'post' });
// });
// //
// // app.use('/url', async function (req, res, next) {
// //   try {
// //     throw new Error('TEST');
// //     res.sendStatus(200);
// //   } catch (error) {
// //     console.log('ERROR => ', error);
// //     next(error);
// //   }
// // });
