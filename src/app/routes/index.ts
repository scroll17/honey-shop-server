import express from 'express';
const router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

class Module {
  constructor(readonly router: express.IRouter) {}

  defMutation(method: 'post' | 'put' | 'delete', path: string, handlers: Array<express.Handler>) {}
}

const module = new Module(router);
module.defMutation('post', `updateUser`, []);
