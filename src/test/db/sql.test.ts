/*external modules*/
import assert from 'assert';
/*DB*/
import { index } from '../../db/sql';
import { $UserTable } from '../../db/types/user';
/*other*/

describe('db/index', () => {
  it('simple index query', () => {
    const email = 'test@gmail.com';
    const name = 'test';

    const { text, values } = index`SELECT * FROM ${$UserTable} WHERE "email" = ${email} AND "name" = ${name}`;

    assert(text, `SELECT * FROM ${$UserTable} WHERE "email" = $1 AND "name" = $2`);
    assert.deepStrictEqual(values, [email, name]);
  });

  it('simple index query with name', () => {
    const queryName = 'select-all';

    const { name } = index`SELECT * FROM ${$UserTable}`.setName(queryName);

    assert(queryName, name);
  });

  it('index query with raw', () => {
    const field = index.raw`"name"`;

    const { text } = index`SELECT lower(daterange(${field}, now(), '[]')) FROM ${$UserTable} users`;

    assert(text, `SELECT lower(daterange("name", now(), '[]')) FROM ${$UserTable} users`);
  });

  it('index query with batch', () => {
    const data = ['one@gmail.com', 'two@gmail.com', index.DEFAULT].map((email, id) => [id + 1, email]);

    const { text, values } = index`INSERT INTO ${$UserTable} ("id", "email") VALUES ${index.batch(data)}`;

    assert(text, `INSERT INTO ${$UserTable} ("id", "email") VALUES ($1, $2),($2, $4),($5, DEFAULT)`);
    assert.deepStrictEqual(values, [1, 'one@gmail.com', 2, 'two@gmail.com', 3]);
  });

  it('index query with query inside', () => {
    const nameOne = 'test-1';
    const nameTwo = 'test-2';

    const { text, values } = index`SELECT * FROM (${index`VALUES (${nameOne}), (${nameTwo})`}) AS table(name)`;

    assert(text, `SELECT * FROM (VALUES ($1), ($2)) AS table(name)`);
    assert.deepStrictEqual(values, [nameOne, nameTwo]);
  });
});
