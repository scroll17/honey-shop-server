/*external modules*/
import { Request, CookieOptions, Response, NextFunction, RequestHandler } from 'express';
import CSRF, { Options } from 'csrf';
/*@core*/
import { HttpVerb } from '../core/decorators';
import { config } from '../../config';
import { ServerError } from '../error';
/*other*/

interface ICSURFConfig {
  cookieOptions: Omit<CookieOptions, 'encode'> & { key: string };
  getToken: (req: Request) => string;
  ignoreMethods?: Array<HttpVerb>;
  csrfOptions?: Options;
}

export function csurf(config: ICSURFConfig): RequestHandler {
  const {
    cookieOptions,
    getToken,
    ignoreMethods = [HttpVerb.GET, HttpVerb.HEAD, HttpVerb.OPTIONS],
    csrfOptions = {},
  } = config ?? {};

  const csrf = new CSRF(csrfOptions);

  return async function csrfMiddleware(req: Request, res: Response, next: NextFunction) {
    const cookieKey = cookieOptions.signed ? 'signedCookies' : 'cookies';
    const cookies = req[cookieKey];

    if (!cookies) {
      return next(new Error('Invalid cookies'));
    }

    let secret = cookies[cookieOptions.key];

    if (!secret) {
      secret = await csrf.secret();
      res.cookie(cookieOptions.key, secret, cookieOptions);
    }

    req.csrfToken = function csrfToken() {
      return csrf.create(secret);
    };

    const isIgnoredMethod = ignoreMethods.includes(req.method as HttpVerb);
    const isValidToken = csrf.verify(secret, getToken(req));

    if (!isIgnoredMethod && !isValidToken) {
      return next(ServerError.httpError(403, 'invalid csrf token', { code: 'EBADCSRFTOKEN' }));
    }

    next();
  };
}

export async function setCsrfSecret(res: Response, options: ICSURFConfig['cookieOptions']) {
  const csrf = new CSRF();

  const secret = await csrf.secret();
  res.cookie(options.key, secret, options);

  return csrf.create(secret);
}

export default csurf({
  cookieOptions: config.http.csrf,
  getToken: (req) => req.get('x-csrf-token') ?? '',
});
