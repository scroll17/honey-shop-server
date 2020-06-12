import path from 'path';
import defaultConfig from './default';

export default {
  name: 'development',
  secretsPath: path.join(__dirname, 'honey-secrets.json'),

  http: {
    host: `http://localhost:${defaultConfig.http.port}`,
    client: `http://localhost:${process.env.CLIENT_PORT}`,
  },

  postgres: {
    disableDrop: false, // TODO _?
    database: 'honey-shop',
    user: 'postgres',
    host: 'database',
    schema: 'public',
  },
};
