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
    database: process.env.DB_NAME as string,
    user: process.env.DB_USERNAME as string,
    host: process.env.DB_HOST as string,
    schema: 'public',
  },
};
