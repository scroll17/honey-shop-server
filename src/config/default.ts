import path from 'path';
import moment from 'moment';

export default {
  public: {
    files: path.resolve(__dirname, '../../../../', 'data/public/files'),
    images: path.resolve(__dirname, '../../../../', 'data/public/images'),
  },

  private: {
    files: path.resolve(__dirname, '../../../../', 'data/private/files'),
    images: path.resolve(__dirname, '../../../../', 'data/private/images'),
  },

  logger: {
    level: 'all',
    filePath: path.resolve(__dirname, '../../logs', moment().format('DD-MM-YYYY') + '.log'),
    useConsole: true,
  },

  cluster: {
    exec: path.join(__dirname, '../../worker.js'),
    numFork: 1,
  },

  postgres: {
    disableDrop: true,
    schema: 'public',
    port: Number(process.env.DB_PORT),
    max: 5,
    min: 1,
    idleTimeoutMillis: 60000,
    connectionTimeoutMillis: 10000,
  },

  http: {
    port: process.env.PORT || 3001,
    cookiesConf: {
      httpOnly: true,
      signed: true,
      domain: 'localhost',
      sameSite: false,
    },
    trustProxy: ['loopback', 'uniquelocal'],
    csrf: {
      key: '_CS_r-f',
      maxAge: 60 * 60, // 1 hour
      httpOnly: true,
      sameSite: true,
      domain: 'localhost',
    },
  },
};
