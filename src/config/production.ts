import path from 'path';

export default {
  name: 'production',
  secretsPath: path.join(__dirname, 'honey-secrets.json'),

  logger: {
    level: ['error', 'fatal', 'warn'],
    useConsole: false,
  },

  http: {
    host: 'https://urk-med.shop/api',
    client: 'https://urk-med.shop',
    cookiesConf: {
      domain: 'urk-med.shop',
    },
  },

  postgres: {
    database: 'beyrep-com',
    user: 'beyrep-com',
    host: '10.73.16.3',
  },
  // TODO
};
