export type HandlerSyncType = "sync" | "async";

/**
 * @description handler for a command. It's just a function that receives Argv
 */
export type HandlerFunction<
  TArgv extends {} = any,
  TType extends HandlerSyncType = HandlerSyncType,
  TReturn = unknown,
> = TType extends "sync" ? ((argv: TArgv) => TReturn)
  : ((argv: TArgv) => Promise<TReturn>);

// export type HandlerFunction = HandlerFunction<any>;
