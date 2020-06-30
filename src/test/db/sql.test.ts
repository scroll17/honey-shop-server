import { config } from '../../config';
import {sql} from "../../db/sql";
import {$UserTable} from "../../db/types/user";

describe('db/sql', () => {
  it('should format SELECT statement', () => {
    // console.log(
    //   'test => ',
    //   sql`SELECT ${new Date()} as "now" FROM ${$UserTable}`.setName('test')
    // )

    sql`SELECT ${new Date()} as "now" FROM ${$UserTable}`.setName('test')
  })
})
