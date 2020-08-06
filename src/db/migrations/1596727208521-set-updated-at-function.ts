import { run } from '../migrate';

// Apply changes
module.exports.up = run(async (db, schema) => {
  await db.query(`
    CREATE OR REPLACE FUNCTION "${schema}".set_updated_at()
    RETURNS TRIGGER AS $$
      BEGIN
        IF NEW IS DISTINCT FROM OLD THEN
          NEW."updatedAt" = now();
          return NEW;
        ELSE
          RETURN OLD;
        END IF;
      END;
    $$ language 'plpgsql'
  `);
});

// Rollback changes
module.exports.down = run(async (db, schema) => {
  await db.query(`DROP FUNCTION "${schema}".set_updated_at()`);
});
