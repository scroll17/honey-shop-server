/* external modules */
import _ from 'lodash'
/* other */
import { config } from '../config';

type WrappedValue<TValue> = { [key in symbol]: { value: TValue } }

const SQL_RAW_KEY = Symbol('SQL-RAW-KEY');
const SQL_BATCH_KEY = Symbol('SQL-BATCH-KEY');
export const schema = config.postgres.schema;

class SqlStatement {
  public name?: string = undefined;

  constructor(public text: string, public values: any[]) {}

  setName(name: string) {
    this.name = name
    return this
  }
}

export function withSchema(tableName: string) {
  return sql.raw(`"${schema}"."${tableName}"`);
}

export function sql(strings: TemplateStringsArray, ...args: any[]) {
  let text = '';
  let paramIndex = 1;
  const values = [];



  return new SqlStatement(text, values)
}

sql.raw = wrapValue(SQL_RAW_KEY)

function wrapValue(symKey: symbol) {
  return <TValue>(value: TValue): WrappedValue<TValue> => ({ [symKey]: { value }})
}

function unwrapValue<TValue>(symKey: symbol, value: WrappedValue<TValue>): TValue {
  return (value as any)[symKey].value
}

function isWrapped<TObject>(symKey: symbol, object: TObject) {
  return (
    _.isObject(object) &&
    Object.getOwnPropertySymbols(object).includes(symKey)
  )
}

function isQuery<TValue>(value: TValue) {
  return (
    _.isObject(value) &&
    _.isString(_.get(value, 'text')) &&
    _.isArray(_.get(value, 'values'))
  )
}
