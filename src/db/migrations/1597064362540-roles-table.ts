import { run } from '../migrate';
import { ROLE_TABLE, UserRole } from '../types/role';
import { createEnum } from '../sql/utils';
import { USER_TABLE } from '../types/user';

// Apply changes
module.exports.up = run(async (db, schema) => {
  const roles = createEnum(UserRole);
  await db.query(`CREATE TYPE "${schema}".USER_ROLE AS ENUM(${roles})`);

  await db.query(`
    CREATE TABLE "${schema}"."${ROLE_TABLE}" (
      "id"          UUID                    NOT NULL DEFAULT gen_random_uuid(),
      "name"        "${schema}".USER_ROLE   NOT NULL,
      "userId"      UUID                    NOT NULL              REFERENCES "${schema}"."${USER_TABLE}" ("id") ON DELETE CASCADE,
      "lastSeenAt"  TIMESTAMPTZ             NOT NULL DEFAULT NOW(),

      "createdAt"   TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
      "updatedAt"   TIMESTAMPTZ             NOT NULL DEFAULT NOW(),

      PRIMARY KEY ("id"),
      CONSTRAINT "unique_role" UNIQUE ("userId", "name")
    )
  `);

  await db.query(`
    CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON "${schema}"."${ROLE_TABLE}"
    FOR EACH ROW
      EXECUTE PROCEDURE "${schema}".set_updated_at()
  `);
});

// Rollback changes
module.exports.down = run(async (db, schema) => {
  await db.query(`
    DROP TRIGGER  set_updated_at
    ON "${schema}"."${ROLE_TABLE}"
  `);
  await db.query(`
    DROP TABLE "${schema}"."${ROLE_TABLE}"
  `);
});
