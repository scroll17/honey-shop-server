/* external modules */
import { Pool, PoolClient, QueryConfig } from 'pg';
/* other */
import { config } from "../config";
import logger from "../logger";

export const schema = config.postgres.schema;

const pool = new Pool({
  ...config.postgres,
  password: config.secrets.postgresPassword
})

pool.on('error', error => logger.error('POOL ERROR:', error));

type GetClientCallback<TReturn> = (client: PoolClient, schema: string) => Promise<TReturn>;

async function query<TReturn = undefined>(config: QueryConfig) {
  return pool.query<TReturn>(config)
}

async function getClient<TReturn = undefined>(cb: GetClientCallback<TReturn>) {
  const client = await pool.connect();

  let result: TReturn;
  try {
    result = await cb(client, schema);
  } catch (error) {
    logger.error('POSTGRES getClient error: ', error);
    throw error;
  } finally {
    client.release();
  }

  return result;
}

async function wrapTransaction<TReturn = undefined>(client: PoolClient, cb: GetClientCallback<TReturn>) {
  let result: TReturn;
  try {
    await client.query('BEGIN');
    result = await cb(client, schema);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }

  return result;
}

async function getClientTransaction<TReturn = undefined>(cb: GetClientCallback<TReturn>) {
  return getClient(client => wrapTransaction(client, cb));
}

(async () => {
  try {
    const query = {
      name: 'get-name',
      text: 'SELECT $1::text',
      values: ['brianc'],
    }

    const result = await pool.query(query)
    logger.info('result => ', result)
  } catch (e) {
    logger.error(e);
  }
})()

export {
  pool,
  query,
  getClient,
  getClientTransaction,
  wrapTransaction
}
