/*external modules*/
import { Handler } from 'express';
/*@core*/
import { ActionOptions, IRouteHandlerConfig, ValidateOptions } from './core/decorators';
/*other*/

type RecordUnknown = Record<string, unknown>;

export type IConfig = IRouteHandlerConfig;
export type IMiddleware = [Array<Handler>, Array<Handler>];

abstract class RouteHandler {
  config: IRouteHandlerConfig = {};
  middleware: [Array<Handler>, Array<Handler>] = [[], []];

  constructor() {}

  validate({ next }: ValidateOptions<RecordUnknown>): void {
    try {
      next();
    } catch (ex) {
      next(ex);
    }
  }

  abstract async action(opts: ActionOptions<never, RecordUnknown>): Promise<void | Error>;
}

export default RouteHandler;
