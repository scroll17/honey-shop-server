import log4js from 'log4js';
import moment from 'moment';

import { config } from './config';

log4js.addLayout('json', (config) => (logEvent) => {
  const data = logEvent.data.map((data) => {
    if (data instanceof Error) {
      return {
        name: data.name,
        stack: data.stack,
        message: data.message,
      };
    } else {
      return data;
    }
  });

  const customEvent = {
    level: logEvent.level.levelStr,
    time: moment(logEvent.startTime).format('HH:mm:ss'),
    data,
  };

  return JSON.stringify(customEvent) + config.separator;
});

log4js.configure({
  appenders: {
    console: {
      type: 'console',
      layout: {
        type: 'pattern',
        pattern: '[%[%p%]] %r %[=>%] %m',
      },
    },
    file: {
      level: 'error',
      type: 'file',
      filename: config.logger.filePath,
      layout: {
        type: 'json',
        separator: ',',
      },
    },
  },
  categories: {
    file: {
      appenders: ['file'],
      level: config.logger.level,
    },
    default: {
      appenders: config.logger.useConsole ? ['console', 'file'] : ['file'],
      level: config.logger.level,
    },
  },
});

const logger = log4js.getLogger();

export default logger;
