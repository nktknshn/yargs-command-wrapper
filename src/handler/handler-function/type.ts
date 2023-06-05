import { EmptyRecord } from "../../common/types";

export type HandlerSyncType = "sync" | "async";

/**
 * @description handler for a command. It's just a function that receives a record of type `TArgv` and returns a value of type `TReturn`. `TSyncType` defines if the handler is sync or async.
 */
export type HandlerFunction<
  TArgs extends EmptyRecord = EmptyRecord,
  TSyncType extends HandlerSyncType = HandlerSyncType,
  TReturn = unknown,
> = TSyncType extends "sync" ? ((argv: TArgs) => TReturn)
  : ((argv: TArgs) => Promise<TReturn>);
