/*external modules*/
import express from 'express';
import csurf from "csurf";
import cookieParser from 'cookie-parser';
/*DB*/
import { pool } from '../db';
/*middleware*/
import protectionMiddleware from './middleware/protection';
import errorHandlers from './middleware/errorHandlers';
/*controllers*/
import ServiceController from "./controllers";
/*other*/
import { config } from '../config';
import { expressLogger } from '../logger';

if (false) pool.query('SELECT 1');

const app: express.Application = express();

app.set('port', config.http.port);
app.set('trust proxy', config.http.trustProxy);

app.disable('x-powered-by');

app.use('/static/images', express.static(config.public.images, { maxAge: '7d' }));
app.use(
  '/static/files',
  (req, res, next) => {
    console.log('config', config.public.files);
    next();
  },
  express.static(config.public.files, { maxAge: '7d' })
);

app.use(expressLogger);

app.use(express.json());

// import { Application } from 'express';
// import app from '../index';
//
// export function applyControllers(app: Application, controllers: Array<any>) {}
//
// // TODO
// // app.get('/', (req, res) => {
// //   res.send({ csrfToken: req.csrfToken() });
// // });
// //
// // app.post('/', (req, res) => {
// //   res.send({ type: 'post' });
// // });
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

protectionMiddleware(app);

ServiceController.setupControllers(app).then(() => {})

app.use(errorHandlers);

export default app;
