/*external modules*/
import express from 'express';
import cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
/*DB*/
import { pool } from '../db';
/*middleware*/
import helmetProtection from './middleware/protection';
import errorHandlers from './middleware/errorHandlers';
/*@core*/
import { applyControllers } from "./core";
/*other*/
import { config } from '../config';
import { expressLogger } from '../logger';

if (false) pool.query('SELECT 1');

const app: express.Application = express();

app.set('port', config.http.port);
app.set('trust proxy', config.http.trustProxy);

app.disable('x-powered-by');

app.use('/images', express.static(config.public.images, { maxAge: '7d' }));

app.use(expressLogger);

app.use(bodyParser.json());
app.use(cookieParser(config.secrets.cookieSecret));

helmetProtection(app);

applyControllers(app, []);

app.use(errorHandlers);

export default app;
