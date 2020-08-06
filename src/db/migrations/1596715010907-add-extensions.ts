import { run } from '../migrate';

// Apply changes
module.exports.up = run(async (db) => {
  await db.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);

  // TODO :problem with install
  //await db.query(`CREATE EXTENSION IF NOT EXISTS postgis`);

  await db.query(`CREATE EXTENSION IF NOT EXISTS citext`);
});

// Rollback changes
module.exports.down = async () => {};
