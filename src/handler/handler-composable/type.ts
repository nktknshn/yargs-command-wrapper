import { EmptyRecord } from "../../common/types";
import { HandlerSyncType } from "../handler-function/type";

/**
 * @description A handler that can be composed with other handlers by `composeHandlers`. It is basically a function along with the names of the commands it supports.
 */
export interface ComposableHandler<
  TNames extends readonly string[] = readonly string[],
  TArgv extends EmptyRecord = EmptyRecord,
  TType extends HandlerSyncType = HandlerSyncType,
  TReturn = unknown,
> {
  handle(argv: TArgv): TType extends "sync" ? TReturn : Promise<TReturn>;
  supports: TNames;
}
