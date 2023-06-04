export type GetFunctionSyncType<T extends (...args: never[]) => unknown> =
  T extends (
    ...args: never[]
  ) => infer R ? R extends Promise<unknown> ? "async" : "sync"
    : never;

export type GetFunctionReturnType<T extends (...args: never[]) => unknown> =
  ReturnType<T> extends Promise<infer R> ? R : ReturnType<T>;
