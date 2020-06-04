// interface ITest {
//   name: string;
//   country?: string;
//
//   findById(args: { a: number }): number;
// }
//
// function select<T>(...args: Array<keyof T>) {
//   const symbol = Symbol('select');
//   return {
//     [symbol]: args
//   }
// }
//
// class CTest implements ITest {
//   public name = 'test';
//
//   //@select
//   findById(args) {
//     return 5
//   }
// }
//
// export namespace Test {
//   const example = new CTest();
//
//   export namespace findById {
//     export type TArgs = {}
//     export type TReturn = {}
//     export const exec = () => {
//       return example.findById({})
//     }
//   }
// }
