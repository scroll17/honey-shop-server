declare module '@honey/types' {
  export namespace TFunction {
    export type DelayedEvent<T = any> = { (): Promise<T> };
  }

  export namespace TObject {}

  export namespace TArray {
    export type PossibleArray<TValue> = TValue | Array<TValue>;

    export type Pair<T, K> = [T, K];
    export type Pairs<T, K> = Pair<T, K>[];
  }
}
