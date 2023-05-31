export type GetFunctionSyncType<T extends (...args: any[]) => any> = T extends (
  ...args: any[]
) => infer R ? R extends Promise<any> ? "async" : "sync"
  : never;

export type GetFunctionReturnType<T extends (...args: any[]) => any> =
  ReturnType<T> extends Promise<infer R> ? R : ReturnType<T>;
