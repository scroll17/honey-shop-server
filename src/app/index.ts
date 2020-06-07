/* external modules */
import express from 'express';
import cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
/* other */
import { config } from '../config';
import { expressLogger } from '../logger';
import helmetProtection from './middleware/protection';
import errorHandlers from './middleware/errorHandlers';

const app: express.Application = express();

app.set('port', config.http.port);
app.set('trust proxy', config.http.trustProxy);

app.disable('x-powered-by');

app.use('/public', express.static(config.publicPath, { maxAge: '7d' }));

app.use(expressLogger);

app.use(bodyParser.json());
app.use(cookieParser(config.secrets.cookieSecret));

helmetProtection(app);

// app.use((req, res) => {
//   res.cookie('access_token', 'Bearer ' + 'token', {
//     expires: new Date(Date.now() + 8 * 3600000) // cookie will be removed after 8 hours
//   })
// })

app.get('/', (req, res) => {
  res.send({ csrfToken: req.csrfToken() });
});

app.post('/', (req, res) => {
  res.send({ type: 'post' });
});

app.use(errorHandlers);

export default app;
