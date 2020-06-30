import * as db from '../db';

export async function setup() {
  // await runMigrations();
}

export async function teardown() {
  await db.pool.end();
}
