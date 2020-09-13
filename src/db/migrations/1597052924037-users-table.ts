import { run } from '../migrate';
import { USER_TABLE } from '../types/user';

// Apply changes
module.exports.up = run(async (db, schema) => {
  await db.query(`
    CREATE TABLE "${schema}"."${USER_TABLE}" (
      "id"                  UUID         NOT NULL DEFAULT gen_random_uuid(),
      "email"               CITEXT       NOT NULL,
      "emailConfirmed"      BOOL         NOT NULL DEFAULT false,
      "firstName"           VARCHAR(100)          DEFAULT NULL,
      "lastName"            VARCHAR(100)          DEFAULT NULL,
      "phone"               VARCHAR(12)           DEFAULT NULL,
      "about"               TEXT                  DEFAULT NULL,

      "avatarId"            UUID                  DEFAULT NULL,

      "password"            VARCHAR(255)          DEFAULT NULL,
      "failedLoginAttempts" INTEGER      NOT NULL DEFAULT 0,
      "locked"              BOOL         NOT NULL DEFAULT false,
      "deleted"             BOOL         NOT NULL DEFAULT false,

      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      PRIMARY KEY ("id"),
      CONSTRAINT "uniq_email" UNIQUE ("email")
    )
  `);

  await db.query(`
    CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON "${schema}"."${USER_TABLE}"
    FOR EACH ROW
      EXECUTE PROCEDURE "${schema}".set_updated_at()
  `);
});

// Rollback changes
module.exports.down = run(async (db, schema) => {
  await db.query(`
    DROP TRIGGER  set_updated_at
    ON "${schema}"."${USER_TABLE}"
  `);
  await db.query(`
    DROP TABLE "${schema}"."${USER_TABLE}"
  `);
});
