import path from 'path';

export default {
  name: 'development',
  secretsPath: path.join(__dirname, 'secrets.json'),

  http: {
    host: 'http://localhost:3001',
    client: 'http://localhost:4000',
  },

  logger: {
    level: '', //TODO
  },

  postgres: {
    disableDrop: false, // TODO _?
    database: 'honey-shop',
    user: 'postgres',
    host: 'database',
    schema: 'public',
  },
};
