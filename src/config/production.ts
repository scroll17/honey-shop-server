import path from 'path';
import os from "os";

export default {
  name: 'production',
  secretsPath: path.join(__dirname, 'honey-secrets.json'),

  logger: {
    level: ['error', 'fatal', 'warn'],
    useConsole: false,
  },

  cluster: {
    numFork: os.cpus().length
  },

  http: {
    host: 'https://urk-med.shop/api',
    client: 'https://urk-med.shop',
    cookiesConf: {
      domain: 'urk-med.shop',
      sameSite: 'strict',
    },
    csrf: {
      domain: 'urk-med.shop',
    },
  },

  postgres: {
    database: process.env.DB_NAME as string,
    user: process.env.DB_USERNAME as string,
    host: process.env.DB_HOST as string
  },
};
