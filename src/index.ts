/* external modules */
import cluster from 'cluster';
import path from 'path';
import os from 'os';
/* other */
import logger from './logger';

const nodeEnv = process.env.NODE_ENV;
const numCPUs = nodeEnv === 'production' ? os.cpus().length : 1;

logger.debug(`Master "${process.pid}" is running`);

cluster.setupMaster({
  exec: path.join(__dirname, './worker.js'),
});

// Fork workers.
for (let i = 0; i < numCPUs; i++) {
  cluster.fork();
}

cluster.on('message', (worker, workerData) => {
  switch (workerData.type) {
    case 'shutdown':
      {
        cluster.disconnect(() => {
          process.exit(workerData.code);
        });
      }
      break;
    default: {
      logger.debug('Master process receive: ', workerData);
    }
  }
});

cluster.on('disconnect', (worker) => {
  logger.debug(`Worker ${worker.id} disconnected`);
});

cluster.on('exit', (worker) => {
  // Replace the dead worker
  if (worker.exitedAfterDisconnect) {
    logger.debug(`Worker ${worker.id} exited`);
  } else {
    logger.debug(`Worker ${worker.id} died :( and new one re-spawned`);
    // TODO filelogger
    cluster.fork();
  }
});

logger.info(`
  ----------------------------------
        Starting WEB Server . . .
        Environment: "${nodeEnv}"
        Cluster count: "${numCPUs}"
  ----------------------------------
`);
