declare module '@honey/types' {
  export namespace TFunction {}

  export namespace TObject {}

  export namespace TArray {
    export type PossibleArray<TValue> = TValue | Array<TValue>
  }
}
