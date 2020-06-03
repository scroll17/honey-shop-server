import _ from 'lodash';

const REQUIRED_SECRETS = {
  jwtSecret: true,
  postgresPassword: true,
  cookieSecret: true,
};

export function getSecrets(path: string): AppSecrets {
  const secrets = require(path);

  _.forEach(REQUIRED_SECRETS, (value, key) => {
    if (value) {
      const secret = secrets[key];
      if (_.isNil(secret)) {
        throw new Error(`Secret '${key}' does not exists. Please add it to ${path}`);
      }
    } else {
      return;
    }
  });

  return secrets;
}

export type AppSecrets = { [key in keyof typeof REQUIRED_SECRETS]: string };
