import log4js from 'log4js';

const isDev = process.env.NODE_ENV === 'development';

log4js.addLayout('json', (config) => (logEvent) => {
  const customEvent = {
    startTime: logEvent.startTime,
    level: logEvent.level.levelStr,
    data: logEvent.data,
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
    'text-file': {
      type: 'file',
      filename: 'text.log',
    },
    'json-file': {
      type: 'file',
      filename: 'app.log',
      layout: {
        type: 'json',
        separator: ',',
      },
    },
  },
  categories: {
    'text-file': {
      appenders: ['text-file'],
      level: 'all',
    },
    'json-file': {
      appenders: ['json-file'],
      level: isDev ? 'all' : 'error',
    },
    default: {
      appenders: ['console'],
      level: 'all', //TODO
    },
  },
});

const logger = log4js.getLogger();

const textLogger = log4js.getLogger('text-file');
const jsonLogger = log4js.getLogger('json-file');

const expressLogger = log4js.connectLogger(logger, {
  level: 'info',
  format: (req, res, format) => format(`":method :url" :status ${JSON.stringify(req.body) || ''}`),
});

export default logger;
export { jsonLogger as fileLogger, textLogger, expressLogger };
