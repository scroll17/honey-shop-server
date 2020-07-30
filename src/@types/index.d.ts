declare module '@honey/types' {
  export namespace TFunction {
    export type DelayedEvent<T = any> = { (): Promise<T> };
  }

  export namespace TObject {}

  export namespace TArray {
    export type PossibleArray<TValue> = TValue | Array<TValue>;
  }
}
