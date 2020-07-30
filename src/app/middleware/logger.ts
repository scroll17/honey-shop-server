/*external modules*/
import { Request, Response, RequestHandler } from 'express';
/*other*/
import { config } from '../../config';
import logger from '../../logger';

const isDev = config.name === 'development';

export type LoggerResponse = Response & {
  loggerData?: {
    startTime: number;
    method: string;
    url: string;
    req?: Request;
  };
};

function onResFinished(this: LoggerResponse) {
  const { startTime, method, url, req } = this.loggerData!;
  const { statusCode } = this;

  const timeDelta = Date.now() - startTime;

  let log = logger.info;
  if (statusCode >= 400 && statusCode < 500) {
    log = logger.warn;
  } else if (statusCode >= 500) {
    log = logger.error;
  }
  log = log.bind(logger);

  let message = `"${method} ${url}" ${statusCode} ${timeDelta}ms `;
  isDev && (message += JSON.stringify(req!.body));

  log(message);
}

export const expressLogger: RequestHandler = (req, res: LoggerResponse, next) => {
  res.loggerData = {
    startTime: Date.now(),
    method: req.method!,
    url: req.url!,
  };

  if (isDev) {
    res.loggerData!['req'] = req;
  }

  res.once('error', onResFinished).once('finish', onResFinished);

  return next();
};
