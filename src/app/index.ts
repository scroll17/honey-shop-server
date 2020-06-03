/* external modules */
import path from 'path';
import express from 'express';
import cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
/* other */
import { config } from '../config';
import helmetProtection from './helmet-protection';
import { expressLogger } from '../logger';

const app: express.Application = express();

app.set('port', process.env.PORT || config.http.port);
app.set('trust proxy', ['loopback', 'uniquelocal']);

app.use(bodyParser.json());

app.use('/public', express.static(path.join(__dirname, 'public'), { maxAge: '7d' }));
app.use(expressLogger);

helmetProtection(app);

app.use(cookieParser(config.secrets.cookieSecret));

// app.use((req, res) => {
//   res.cookie('access_token', 'Bearer ' + 'token', {
//     expires: new Date(Date.now() + 8 * 3600000) // cookie will be removed after 8 hours
//   })
// })

app.get('/', (req, res) => {
  res.send({ Y2: 'hello world!!!' });
});

export default app;
