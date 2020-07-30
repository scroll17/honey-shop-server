/*external modules*/
import assert from 'assert';
import _ from 'lodash';
/*DB*/
/*other*/
import { ServerError } from '../../app/error';

export namespace Test {
  type TPrimitive = string | number | symbol | boolean | null | undefined;

  type TCheckPrimitive<TValue> =
    | string
    | number
    | symbol
    | boolean
    | {
        $check: '==' | '===' | '!==' | '!=' | '>=' | '<=' | '<' | '>' | 'equal' | 'notEqual' | 'strictEqual';
        $value: TPrimitive;
        $func?: (value: TValue) => TPrimitive;
        $eMessage?: ((valueInData: TValue, value: TPrimitive) => string) | string;
      };

  type TCheckObject<TObject> =
    | {
        [TPath in keyof TObject]?: TObject[TPath] extends Array<infer TArrayItem>
          ?
              | {
                  [TKey in number]?:
                    | TCheckObject<TObject[TPath][TKey]>
                    | TCheckPrimitive<TObject[TPath][TKey]>;
                }
              | ({ $check: 'forEach' } & (TArrayItem extends TPrimitive ? never : TCheckObject<TArrayItem>))
              | {
                  $check: 'some' | 'every';
                  $value: (value: TArrayItem) => boolean;
                  $eMessage?: string;
                }
          : TObject[TPath] extends TPrimitive | Date
          ? TCheckPrimitive<TObject[TPath]>
          : TObject[TPath] extends Record<string, any>
          ? TCheckObject<TObject[TPath]>
          : TCheckPrimitive<TObject[TPath]>;
      }
    | {
        [x: string]: any;
      };

  type TCheck<TData> = TData extends Array<infer TValue>
    ? { (value: TValue): TCheckObject<TValue> } | TCheckObject<TValue>
    : TCheckObject<TData>;

  export class Check {
    private static keyProperties = ['$value', '$check', '$func', '$eMessage'];

    public static error<TServerError>(error: TServerError, desiredError: ServerError | Error) {
      if (!error) throw ServerError.notFound('errors');

      assert(
        _.get(error, 'message') == _.get(desiredError, 'message'),
        `there should be error: "${desiredError.message}"`
      );
    }

    private static createErrorMessage(valueInData: any, value: any, stackPaths: string[]): string {
      const stackError = stackPaths.join('.');

      let errorMessage = `Incorrect "${stackError}".`;

      if (_.has(value, '$eMessage')) {
        errorMessage = _.isFunction(value.$eMessage)
          ? value.$eMessage(valueInData, value.$value)
          : value.$eMessage;
      }

      return errorMessage;
    }

    private static compare(operator: string, actual: any, expected: any, errorMessage: string) {
      switch (operator) {
        case '===':
          assert.ok(actual === expected, errorMessage);
          break;
        case '==':
          assert.ok(actual == expected, errorMessage);
          break;
        case '!==':
          assert.ok(actual !== expected, errorMessage);
          break;
        case '!=':
          assert.ok(actual != expected, errorMessage);
          break;
        case '>=':
          assert.ok(actual >= expected, errorMessage);
          break;
        case '<=':
          assert.ok(actual <= expected, errorMessage);
          break;
        case '<':
          assert.ok(actual < expected, errorMessage);
          break;
        case '>':
          assert.ok(actual > expected, errorMessage);
          break;
        case 'equal':
          assert.equal(actual, expected, errorMessage);
          break;
        case 'notEqual':
          assert.notEqual(actual, expected, errorMessage);
          break;
        case 'strictEqual':
          assert.strictEqual(actual, expected, errorMessage);
          break;
        case 'some':
          assert.ok(_.some(actual, expected), errorMessage);
          break;
        case 'every':
          assert.ok(_.every(actual, expected), errorMessage);
          break;
        default:
          throw new ServerError(`Undefined operator: "${operator}".`);
      }
    }

    private static equal<TData>(
      data: TData,
      dataToCheck: TCheckObject<TData> | Record<string, unknown>,
      stackPaths: string[] = []
    ) {
      if (_.isUndefined(data)) {
        throw new ServerError(`"${stackPaths.join('.')}" Not Found. See GraphQL query schema.`);
      }

      if (_.isObject(data) && !_.isObject(dataToCheck)) {
        throw new ServerError(`
          in "${stackPaths.join('.')}": "${_.last(
          stackPaths
        )}" is object. Cannot use default 'equal' for object.
        `);
      }

      if (_.isObject(data) && Object.getPrototypeOf(data) === Object.prototype) {
        Object.keys(dataToCheck).forEach((field) => {
          if (Check.keyProperties.includes(field)) {
            throw new ServerError(
              `in "${stackPaths.join('.')}": "${_.last(
                stackPaths
              )}" is object. You must use nesting for the object.`
            );
          }

          const valueInData = _.get(data, field);
          const value = _.get(dataToCheck, field);

          Check.equal(valueInData, value, stackPaths.concat(field));
        });
      } else {
        const stackError = stackPaths.join('.');

        if (_.isObject(dataToCheck)) {
          const $check = _.get(dataToCheck, '$check');
          if (!$check) {
            throw new ServerError(`in "${stackError}": "$check" required.`);
          }

          const $value = _.get(dataToCheck, '$value');
          if (_.isUndefined($value)) {
            throw new ServerError(`in "${stackError}": "$value" required.`);
          }

          if ($check === 'some' || $check === 'every') {
            if (!_.isArray(data)) {
              throw new ServerError(`in "${stackError}": ${_.last(stackPaths)} is not array.`);
            }
            if (!_.isFunction($value)) {
              throw new ServerError(`in "${stackError}": $value" must be a function.`);
            }

            return Check.compare(
              $check,
              data,
              $value,
              Check.createErrorMessage(data, dataToCheck, stackPaths)
            );
          }

          const $func = _.get(dataToCheck, '$func');
          if ($func) {
            if (!_.isFunction($func)) {
              throw new ServerError(`in "${stackError}": "$func" must be a function.`);
            }

            Check.compare(
              $check,
              $func(data),
              $func($value),
              Check.createErrorMessage(data, dataToCheck, stackPaths)
            );
          } else {
            if (_.isObject($value) || _.isObject(data)) {
              throw new ServerError(`in "${stackError}": "${_.last(
                stackPaths
              )}" and "$value" must be a primitive.
              "${_.last(stackPaths)}" is ${typeof data};
              "$value" is ${typeof $value};
              Possibly incorrect value in "$check".
             `);
            }

            Check.compare($check, data, $value, Check.createErrorMessage(data, dataToCheck, stackPaths));
          }
        } else {
          if (_.isUndefined(dataToCheck)) {
            throw new ServerError(`Your "${stackError}" is undefined.`);
          }

          Check.compare('equal', data, dataToCheck, Check.createErrorMessage(data, dataToCheck, stackPaths));
        }
      }
    }

    private static check<TData>(data: TData, dataToCheck: TCheckObject<TData>) {
      _.forEach(dataToCheck, (value, field) => {
        const valueInData = _.get(data, field);

        if (_.isArray(valueInData)) {
          if (!_.isObject(value) || _.isArray(value)) {
            throw new ServerError(
              `"${field}" is array. Please use object for iteration or object to get element of array.`
            );
          }

          if (_.has(value, '$check')) {
            if (_.get(value, '$check') !== 'forEach') {
              return Check.equal(valueInData, value, [field]);
            }

            _.forEach(valueInData, (data) => Check.equal(data, _.omit(value, Check.keyProperties), [field]));
          } else {
            Object.keys(value).forEach((item) => {
              if (!_.isNaN(Number(item))) {
                Check.equal(_.nth(valueInData, Number(item)), _.get(value, item), [field, item]);
              } else {
                throw new ServerError(`"${field}" is array. You must use numbers to get item in arrays.`);
              }
            });
          }
        } else {
          Check.equal(valueInData, value, [field]);
        }
      });
    }

    static data<TData, TFields = Array<keyof TData>>(
      data: TData | TData[],
      dataToCheck: TCheck<TData | TData[]>
    ) {
      if (!data) throw ServerError.notFound('data');

      if (data instanceof Array) {
        return data.forEach((data) => {
          if (_.isFunction(dataToCheck)) {
            Check.check(data, dataToCheck(data));
          } else {
            Check.check(data, dataToCheck);
          }
        });
      }

      if (_.isFunction(dataToCheck)) {
        throw new ServerError(`"data" is not array. The second parameter should be an object.`);
      }

      return Check.check(data, dataToCheck);
    }
  }
}
