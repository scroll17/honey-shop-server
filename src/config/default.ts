import path from 'path';
import moment from 'moment';

const createPath = (access: 'public' | 'private', type: string) => `/var/www/html/${access}/${type}`;

export default {
  public: {
    files: createPath('public', 'files'),
    images: createPath('public', 'images'),
  },

  private: {
    files: createPath('private', 'files'),
    images: createPath('private', 'images'),
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
    schema: 'public',
    port: Number(process.env.DB_PORT),
    max: 5,
    min: 0,
    idleTimeoutMillis: 60000,
    connectionTimeoutMillis: 10000,
  },

  http: {
    port: process.env.PORT || 3001,
    // TODO _check
    cookiesConf: {
      httpOnly: true,
      signed: true,
      domain: 'localhost',
      sameSite: false,
    },
    trustProxy: ['loopback', 'uniquelocal'],
    csrf: {
      key: 'csrf-token',
      maxAge: 60 * 60, // 1 hour
      httpOnly: true,
      sameSite: true,
      domain: 'localhost',
    },
  },
};
