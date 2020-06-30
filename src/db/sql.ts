/* external modules */
/* other */
import { config } from "../config";

export const schema = config.postgres.schema;

export function sql(strings: TemplateStringsArray, ...args: any[]){
  return {
    text: 'SELECT * FROM user WHERE id = $1',
    values: [1],
  }
}

function withSchema(tableName: string) {
 return sql.raw(`"${schema}"."${tableName}"`)
}

const USER_TABLE = 'User';
export const UserTable = withSchema(USER_TABLE)
