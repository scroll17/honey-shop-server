import { Application } from 'express';
import app from "../index";

export function applyControllers(app: Application, controllers: Array<any>) {

}

// TODO
app.get('/', (req, res) => {
  res.send({ csrfToken: req.csrfToken() });
});

app.post('/', (req, res) => {
  res.send({ type: 'post' });
});

app.use('/url', async function (req, res, next) {
  try {
    throw new Error('TEST');
    res.sendStatus(200);
  } catch (error) {
    console.log('ERROR => ', error);
    next(error);
  }
});
