import path from 'path';
import _ from 'lodash';

export default {
  name: 'test',
  secretsPath: path.join(__dirname, 'secrets.json'),

  http: {
    host: 'http://localhost:3001',
    client: 'http://localhost:4000',
  },

  logger: {
    level: 'all',
  },

  postgres: {
    disableDrop: false,
    database: 'honey-shop',
    user: 'postgres',
    host: 'database',
    schema: `beyrep_testing_${_.uniqueId()}`,
  },
};
