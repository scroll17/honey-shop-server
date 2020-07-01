/*external modules*/
import assert from 'assert';
/*DB*/
import { sql } from '../../db/sql';
import { $UserTable } from '../../db/types/user';
/*other*/

describe('db/sql', () => {
  it('simple sql query', () => {
    const email = 'test@gmail.com';
    const name = 'test';

    const { text, values } = sql`SELECT * FROM ${$UserTable} WHERE "email" = ${email} AND "name" = ${name}`;

    assert(text, `SELECT * FROM ${$UserTable} WHERE "email" = $1 AND "name" = $2`);
    assert.deepStrictEqual(values, [email, name]);
  });

  it('simple sql query with name', () => {
    const queryName = 'select-all';

    const { name } = sql`SELECT * FROM ${$UserTable}`.setName(queryName);

    assert(queryName, name);
  });

  it('sql query with raw', () => {
    const field = sql.raw`"name"`;

    const { text } = sql`SELECT lower(daterange(${field}, now(), '[]')) FROM ${$UserTable} users`;

    assert(text, `SELECT lower(daterange("name", now(), '[]')) FROM ${$UserTable} users`);
  });

  it('sql query with batch', () => {
    const data = ['one@gmail.com', 'two@gmail.com', sql.DEFAULT].map((email, id) => [id + 1, email]);

    const { text, values } = sql`INSERT INTO ${$UserTable} ("id", "email") VALUES ${sql.batch(data)}`;

    assert(text, `INSERT INTO ${$UserTable} ("id", "email") VALUES ($1, $2),($2, $4),($5, DEFAULT)`);
    assert.deepStrictEqual(values, [1, 'one@gmail.com', 2, 'two@gmail.com', 3]);
  });

  it('sql query with query inside', () => {
    const nameOne = 'test-1';
    const nameTwo = 'test-2';

    const { text, values } = sql`SELECT * FROM (${sql`VALUES (${nameOne}), (${nameTwo})`}) AS table(name)`;

    assert(text, `SELECT * FROM (VALUES ($1), ($2)) AS table(name)`);
    assert.deepStrictEqual(values, [nameOne, nameTwo]);
  });
});
