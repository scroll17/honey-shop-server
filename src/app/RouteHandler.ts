import { Request, Response, NextFunction } from 'express';

abstract class RouteHandler {
  constructor() {
    const func = this.action;

    this.action = async (req, res, next) => {
      try {
        await this.validate(req, res, next);
        await func.call(this, req, res, next);
      } catch (ex) {
        next(ex);
      }
    };
  }

  abstract async validate(req: Request, res: Response, next: NextFunction): Promise<void | Error>;

  abstract async action(req: Request, res: Response, next: NextFunction): Promise<void | Error>;
}

export default RouteHandler;
