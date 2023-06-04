import { EmptyRecord } from "../../common/types";

export type HandlerSyncType = "sync" | "async";

/**
 * @description handler for a command. It's just a function that receives a record of type `TArgv` and returns a value of type `TReturn`.
 */
export type HandlerFunction<
  // TArgs extends EmptyRecord = Record<string, never>,
  TArgs extends EmptyRecord = EmptyRecord,
  TType extends HandlerSyncType = HandlerSyncType,
  TReturn = unknown,
> = TType extends "sync" ? ((argv: TArgs) => TReturn)
  : ((argv: TArgs) => Promise<TReturn>);
