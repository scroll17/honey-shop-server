/*external modules*/
import csurf from 'csurf';
/*other*/
import { config } from '../../config';

// https://github.com/expressjs/csurf
export default csurf({
  cookie: config.http.csrf,
  value: (req) => req.get('x-client-accept') ?? '',
});
