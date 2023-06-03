export interface NonEmptyTuple<A> extends ReadonlyArray<A> {
  0: A;
}

export type EmptyRecord = {};
// export type EmptyRecordType = Record<any, any>;
// export type EmptyRecordType = object;
// export type EmptyRecord = Record<string, unknown>;
