export default {
  logger: {
    level: 'all',
  },

  postgres: {
    disableDrop: true,
    schema: 'public',
    port: 5432,
    max: 10,
    min: 3,
    idleTimeoutMillis: 60000,
    connectionTimeoutMillis: 10000,
  },

  http: {
    port: 3001,
    cookiesConf: {
      httpOnly: true,
      signed: true,
      domain: 'localhost',
    },
    trustProxy: ['loopback', 'uniquelocal'],
  },
};
