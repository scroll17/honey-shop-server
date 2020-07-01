/*external modules*/
import { isObject } from 'lodash';
/*other*/
import { config } from '../config';

type WrappedValue<TValue> = { [key in symbol]: { value: TValue } };

const SQL_RAW_KEY = Symbol('SQL-RAW-KEY');
const SQL_BATCH_KEY = Symbol('SQL-BATCH-KEY');
const SQL_DEFAULT_KEY = Symbol(`SQL-DEFAULT-KEY`);

export const schema = config.postgres.schema;

export class SqlStatement {
  public name?: string = undefined;

  constructor(public text: string, public values: Array<any>) {}

  setName(name: string): this {
    this.name = name;
    return this;
  }
}

export function withSchema(tableName: string): WrappedValue<string> {
  return sql.raw(`"${schema}"."${tableName}"`);
}

export function sql(strings: TemplateStringsArray, ...args: any[]): SqlStatement {
  let text = '';
  let paramIndex = 1;
  const values: any[] = [];

  strings.forEach((string, index) => {
    if (index < args.length) {
      const value = args[index];
      let replacement = '';

      if (isQuery(value)) {
        replacement = value.text.replace(/\$(\d+)/gm, () => {
          return `$${paramIndex++}`;
        });
        values.push(...value.values);
      } else if (isDefault(value)) {
        replacement = unwrapValue(SQL_DEFAULT_KEY, value);
      } else if (isRaw(value)) {
        replacement = unwrapValue(SQL_RAW_KEY, value);
      } else if (isBatch(value)) {
        const batchValues = unwrapValue<any[][]>(SQL_BATCH_KEY, value);
        replacement = batchValues
          .map((batchValue) => {
            const batchStr = batchValue
              .map((value) => {
                if (isDefault(value)) {
                  return unwrapValue(SQL_DEFAULT_KEY, value);
                } else {
                  values.push(value);
                  return `$${paramIndex++}`;
                }
              })
              .join(',');

            return `(${batchStr})`;
          })
          .join(',');
      } else {
        replacement = `$${paramIndex++}`;
        values.push(value);
      }

      text += `${string}${replacement}`;
    } else {
      text += string;
    }
  });

  return new SqlStatement(text, values);
}

sql.raw = wrapValue(SQL_RAW_KEY);
sql.batch = wrapValue(SQL_BATCH_KEY);
sql.DEFAULT = wrapValue(SQL_DEFAULT_KEY)('DEFAULT');

function wrapValue(symKey: symbol) {
  return <TValue>(value: TValue): WrappedValue<TValue> => ({ [symKey]: value });
}

function unwrapValue<TValue>(symKey: symbol, value: WrappedValue<TValue>): TValue {
  return (value as any)[symKey];
}

function isWrapped<TObject>(symKey: symbol, object: TObject) {
  return isObject(object) && Object.getOwnPropertySymbols(object).includes(symKey);
}

const isDefault = <TObject>(value: TObject) => isWrapped(SQL_DEFAULT_KEY, value);
const isRaw = <TObject>(value: TObject) => isWrapped(SQL_RAW_KEY, value);
const isBatch = <TObject>(value: TObject) => isWrapped(SQL_BATCH_KEY, value);

function isQuery<TValue>(value: TValue) {
  return isObject(value) && value instanceof SqlStatement;
}
