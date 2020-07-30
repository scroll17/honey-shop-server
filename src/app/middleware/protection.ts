/*external modules*/
import helmet from 'helmet';
import nocache from 'nocache';
/*other*/

// TODO:  reseash
export default () => [
  // helmet.contentSecurityPolicy() // https://github.com/helmetjs/csp
  helmet.hsts(), // https://github.com/helmetjs/hsts
  helmet.ieNoOpen(), // https://github.com/helmetjs/ienoopen
  helmet.frameguard(), // https://github.com/helmetjs/frameguard
  helmet.xssFilter(), // https://github.com/helmetjs/x-xss-protection

  nocache(), // https://github.com/helmetjs/nocache
];
