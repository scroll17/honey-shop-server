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
    schema: `honey_testing_${_.uniqueId()}`,
    database: process.env.DB_NAME as string,
    user: process.env.DB_USERNAME as string,
    host: process.env.DB_HOST as string,
  },
};
