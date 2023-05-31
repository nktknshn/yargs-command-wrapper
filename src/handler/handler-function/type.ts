import { EmptyRecord } from "../../common/types";

export type HandlerSyncType = "sync" | "async";

/**
 * @description handler for a command. It's just a function that receives Argv
 */
export type HandlerFunction<
  // XXX changing any breaks
  TArgv extends EmptyRecord = any,
  TType extends HandlerSyncType = HandlerSyncType,
  TReturn = unknown,
> = TType extends "sync" ? ((argv: TArgv) => TReturn)
  : ((argv: TArgv) => Promise<TReturn>);

// export type HandlerFunction = HandlerFunction<any>;
