/* external modules */
import express from 'express';
import cors from 'cors';
import path from 'path'
/* other */
import { expressLogger } from "../logger";

const app: express.Application = express();

app.set('port', (process.env.PORT || 3001))
app.set('trust proxy', ['loopback', 'uniquelocal'])

app.use(cors());
app.use(express.json());

app.use('/public', express.static(path.join(__dirname, 'public'), { maxAge: '7d' }));
app.use(expressLogger);

app.get('/', (req, res) => {
    console.log('req.body => ', req.body)
    res.send({ Y2: 'hello world!!!' })
})

export default app;
