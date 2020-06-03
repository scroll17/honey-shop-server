import path from 'path';
import _ from 'lodash';
import defaultConfig from './default';

export default {
  name: 'test',
  secretsPath: path.join(__dirname, 'honey-secrets.json'),

  http: {
    host: `http://localhost:${defaultConfig.http.port}`,
    client: `http://localhost:${4100}`,
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
