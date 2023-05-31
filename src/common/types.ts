export interface NonEmptyTuple<A> extends ReadonlyArray<A> {
  0: A;
}

export type EmptyRecord = {};
// export type EmptyRecord = Record<string, unknown>;
