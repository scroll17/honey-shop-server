/*external modules*/
import querystring, { ParsedUrlQueryInput } from 'querystring';
import _ from 'lodash';
/*other*/
import { getSecrets, AppSecrets } from './secrets';
import devConfig from './development';
import proConfig from './production';
import testConfig from './test';
import defaultConfig from './default';

export interface AppConfig {
  name: string;

  secretsPath: string;
  publicPath: string;

  logger: {
    level: string;
    filePath: string;
  };

  postgres: {
    disableDrop: boolean;
    schema: string;
    user: string;
    host: string;
    database: string;
    port: number;
    // pool config
    max: number;
    min: number;
    idleTimeoutMillis: number;
    connectionTimeoutMillis: number;
  };

  http: {
    port: number | string;
    host: string;
    client: string;
    trustProxy: string[];
    cookiesConf: {
      httpOnly: boolean;
      signed: boolean;
      domain: string;
    };
  };
}

export type IConfig = AppConfig & {
  secrets: AppSecrets;
  utils: {
    clientUrl(path: string, queryParams?: { [key: string]: any }): string;
    apiUrl(path: string, queryParams?: { [key: string]: any }): string;
  };
};

function buildConfig(): IConfig {
  const configName = (process.env.NODE_ENV || 'development').toLowerCase();

  let currentConfig;
  switch (configName) {
    case 'development': {
      currentConfig = devConfig;
      break;
    }
    case 'production': {
      currentConfig = proConfig;
      break;
    }
    case 'test': {
      currentConfig = testConfig;
      break;
    }
    default: {
      throw new Error(`Config '${configName}' does not exists`);
    }
  }

  const mergedConfig: AppConfig = _.merge(defaultConfig, currentConfig);

  return {
    ...mergedConfig,
    secrets: getSecrets(mergedConfig.secretsPath),
    utils: {
      clientUrl: urlBuilder(mergedConfig.http.client),
      apiUrl: urlBuilder(mergedConfig.http.host),
    },
  };
}

const urlBuilder = (base: string) => (path: string, queryParams?: ParsedUrlQueryInput) => {
  if (path.startsWith('/')) path = path.slice(1);
  const query = queryParams ? `?${querystring.stringify(queryParams)}` : '';
  return `${base}/${path}${query}`;
};

export const config = buildConfig();
