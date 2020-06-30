/* external modules */
import express from 'express';
import cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
/* other */
import { config } from '../config';
import { expressLogger } from '../logger';
import helmetProtection from './middleware/protection';
import errorHandlers from './middleware/errorHandlers';
import { pool } from "../db";

if(false) pool.query('SELECT 1')

const app: express.Application = express();

app.set('port', config.http.port);
app.set('trust proxy', config.http.trustProxy);

app.disable('x-powered-by');

app.use('/images', express.static(config.public.images, { maxAge: '7d' }));

app.use(expressLogger);

app.use(bodyParser.json());
app.use(cookieParser(config.secrets.cookieSecret));

helmetProtection(app);

/** TEST */

app.get('/', (req, res) => {
  res.send({ csrfToken: req.csrfToken() });
});

app.post('/', (req, res) => {
  res.send({ type: 'post' });
});

app.use("/url", async function (req, res, next) {
  try {
    throw new Error('TEST')
    res.sendStatus(200);
  } catch (error) {
    console.log('ERROR => ', error)
    next(error)
  }
});

/** TEST */

app.use(errorHandlers);

export default app;
