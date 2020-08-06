/*external modules*/
import { MigrationStore } from 'migrate';
/*DB*/
import { getClient } from '../index';
/*other*/
import { config } from '../../config';
import logger from '../../logger';

const PG_USER: string = config.postgres.user;

/** https://github.com/tj/node-migrate/blob/main/examples/custom-state-storage/custom-state-storage.js */
export const customStateStorage: MigrationStore = {
  async load(cb) {
    try {
      await getClient(async (client, schema) => {
        await client.query(`CREATE SCHEMA IF NOT EXISTS "${schema}" AUTHORIZATION "${PG_USER}"`);

        await client.query(`
          CREATE TABLE IF NOT EXISTS "${schema}"."migrations" (
            id      INTEGER PRIMARY KEY,
            data    JSONB   NOT NULL
          )
        `);

        const { rows } = await client.query(`SELECT data FROM "${schema}"."migrations"`);

        if (rows.length !== 1) return cb(null, {});

        cb(null, rows[0].data);
      });
    } catch (error) {
      logger.fatal('Cannot load migrations from database', error);
      throw error;
    }
  },
  async save(set, cb) {
    try {
      await getClient(async (client, schema) => {
        // Save migration results
        await client.query(
          `
            INSERT INTO "${schema}"."migrations" (id, data)
            VALUES (1, $1)
            ON CONFLICT (id)
                DO UPDATE SET data = $1
          `,
          [{ lastRun: set.lastRun, migrations: set.migrations }]
        );

        cb();
      });
    } catch (error) {
      logger.fatal('Cannot save migration result into DB', error);
      throw error;
    }
  },
};
