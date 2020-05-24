/* external modules */
import express from 'express';
import cors from 'cors';
import * as bodyParser from 'body-parser';
import path from 'path';
/* other */
import helmetProtection from './helmet-protection';
import { expressLogger } from '../logger';

const app: express.Application = express();

app.set('port', process.env.PORT || 3002);
app.set('trust proxy', ['loopback', 'uniquelocal']);

app.use(cors());
app.use(bodyParser.json());

app.use('/public', express.static(path.join(__dirname, 'public'), { maxAge: '7d' }));
app.use(expressLogger);

helmetProtection(app);

app.get('/', (req, res) => {
  console.log('req.body => ', req.body);
  res.send({ Y2: 'hello world!!!' });
});

export default app;
