/* external modules */
import http from 'http';
import _ from 'lodash';
/* app */
import app from './app';
/* other */
import logger from './logger';

const server = http.createServer(app).listen(app.get('port'), app.get('host'));

server.on('error', (error) => {
  if (_.get(error, 'syscall') !== 'listen') throw error;

  const port = app.get('port');
  const bind = _.isString(port) ? `Pipe ${port}` : `Port ${port}`;

  // handle specific listen errors with friendly messages
  switch (_.get(error, 'code')) {
    case 'EACCES':
      logger.error(`${bind} requires elevated privileges.`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(`${bind} is already in use.`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

server.on('listening', () => {
  const addr = server.address();
  const bind = _.isString(addr) ? `pipe ${addr}` : `port ${addr!.port}`;

  logger.info('Listening on ' + bind);
});
