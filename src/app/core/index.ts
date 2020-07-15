import 'reflect-metadata';
import { Router, Application, Request, Response } from 'express'
import {ClassMetaKey, ErrorMiddleware, IClass, IClassMetadata, IRouteMetadata, RoutesMetaKey} from "./decorators/types";


// TODO
export interface RouteContext {
  currentUser?: string;
  db: string;
  // /** User record if valid auth token provided */
  // currentUser?: User;
  // /** If admin is impersonating user we store admin user in this field */
  // impersonatingUser?: User;
  // /** Helpers to defQuery postres */
  // db: DB;
  // /** Helpers to build SQL defQuery */
  // sql: typeof sql;
  // /** DataLoaders for caching defQuery */
  // dataLoader: DataLoaderPackage;
  // /** Request */
  // req?: IncomingMessage;
  // /** By default empty array. Used for running delayed events (e.g. run outside the transaction)*/
  // events: TFunction.DelayedEvent[];
}

export * from './decorators'

export function applyControllers<TController extends IClass>(app: Application, controllers: Array<TController>) {
  let errorMiddleware: ErrorMiddleware[] = [];

  controllers.forEach(controller => {
    const expressRoute = Router();

    const { prefix, errorHandlers } = expandClassMetadata(controller, expressRoute)
    errorMiddleware = errorMiddleware.concat(errorHandlers)

    expandRoutesMetadata(controller, expressRoute)

    app.use(prefix, expressRoute)
  })

  errorMiddleware.forEach(middleware => app.use(middleware))
}

function expandClassMetadata<TController extends IClass>(controller: TController, Router: Router): Omit<IClassMetadata, 'handlers'> {
  const classMetadata: IClassMetadata = Reflect.getMetadata(ClassMetaKey, controller);

  if('handlers' in classMetadata) {
    classMetadata['handlers'].forEach(({ prefix, handler }) => {
      if(prefix === '') {
        Router.use(handler)
      } else {
        if(Array.isArray(prefix)) {
          const regular = new RegExp(`(${prefix.join('|')})$`)
          Router.use(regular, handler)
        } else {
          Router.use(prefix, handler)
        }
      }
    })
  }

  return {
    prefix: classMetadata.prefix,
    errorHandlers: classMetadata.errorHandlers ?? []
  }
}

function expandRoutesMetadata<TController extends IClass>(controller: TController, Router: Router) {
  const instance = new controller();
  //const routes: Array<IRouteMetadata> = Reflect.getMetadata(RoutesMetaKey, controller);
  const routes: Array<IRouteMetadata> = Reflect.getMetadata('routes', controller);

  // TODO: UPDATE!
  routes.forEach(route => {
    Router[route.requestMethod](route.path, (req: Request, res: Response, next) => {
      instance[route.methodName](req, res, next);
    });
  })
}
