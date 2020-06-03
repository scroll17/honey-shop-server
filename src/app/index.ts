/* external modules */
import express from 'express';
import cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
/* other */
import { config } from '../config';
import { expressLogger } from '../logger';
import helmetProtection from './helmet-protection';

const app: express.Application = express();

app.set('port', config.http.port);
app.set('trust proxy', config.http.trustProxy);

app.disable('x-powered-by');

app.use(bodyParser.json());
app.use('/public', express.static(config.publicPath, { maxAge: '7d' }));
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
