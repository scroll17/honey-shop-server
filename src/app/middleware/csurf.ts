/*external modules*/
import csurf from 'csurf';
/*@core*/
import {HttpVerb} from "../core/decorators";
/*other*/
import { config } from '../../config';

// https://github.com/expressjs/csurf
export const custCsurf = (ignoreMethods: Array<HttpVerb | string> = [HttpVerb.HEAD, HttpVerb.OPTIONS]) => csurf({
  cookie: config.http.csrf,
  value: (req) => req.get('x-client-accept') ?? '',
  ignoreMethods: ignoreMethods
});

export default csurf({
  cookie: config.http.csrf,
  value: (req) => req.get('x-client-accept') ?? '',
  ignoreMethods: [HttpVerb.HEAD, HttpVerb.OPTIONS]
});
