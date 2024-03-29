/* external modules */
import cluster from 'cluster';
/* other */
import { config } from './config';
import logger from './logger';

logger.debug(`Master "${process.pid}" is running`);

cluster.setupMaster(config.cluster);

// Fork workers.
for (let i = 0; i < config.cluster.numFork; i++) {
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
    logger.error(`Worker ${worker.id} died :( and new one re-spawned`);
    cluster.fork();
  }
});

logger.info(`
  ----------------------------------
        Starting WEB Server . . .
        Environment: "${config.name}"
        Cluster count: "${config.cluster.numFork}"
  ----------------------------------
`);
