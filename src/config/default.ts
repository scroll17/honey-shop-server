import path from 'path';
import moment from 'moment';

export default {
  publicPath: path.resolve(__dirname, '../../', 'public'),

  logger: {
    level: 'all',
    filePath: path.resolve(__dirname, '../../logs', moment().format('DD-MM-YYYY') + '.log'),
    useConsole: true,
  },

  postgres: {
    disableDrop: true,
    schema: 'public',
    port: 5432,
    max: 10,
    min: 3,
    idleTimeoutMillis: 60000,
    connectionTimeoutMillis: 10000,
  },

  http: {
    port: process.env.PORT || 3001,
    cookiesConf: {
      httpOnly: true,
      signed: true,
      domain: 'localhost',
    },
    trustProxy: ['loopback', 'uniquelocal'],
  },
};
