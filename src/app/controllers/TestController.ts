import {ClassErrorMiddleware, ClassMiddleware, Controller, SingleClassMiddleware} from "../core";
import { Get } from "../core";


import {NextFunction, Request, Response} from 'express'
import logger from "../../logger";

@Controller('/test')
@ClassMiddleware([])
@SingleClassMiddleware('findById', (req, res, next) => { next() })
@ClassErrorMiddleware(
  (err, req, res, next) => {

    next()
  }
)
class TestController {
  @Get({ postfix: '/:id' })
  findById(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const { body, params } = req;

      logger.info('body', body)
      logger.info('params', params)

      if(Number(params.id) > 10) {
        throw new Error(`ID > 10`)
      }

      return res.send({ body, params })
    } catch (ex) {
      logger.error('in TestController/findById', ex)
      next(ex)
    }
  }
}

export default TestController


// class DeleteController {
//
// }

// @Controller('user')
// class UserController {
//
//   @Autentificate('user' | 'vendor' | 'admin')
//   @Post
//   @Validate((yup, req) => {
//     const { body } = req;
//
//     const schema = {
//       name: yup.string()
//     }
//   })
//   create(req, res, next) {
//
//   }
//
//   @Post
//   @InjectRouteController
//   update!: DeleteController
// }
