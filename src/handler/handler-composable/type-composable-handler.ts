import { CommandArgs } from "../../command/commands/args/type-command-args";
import { CommandArgsGeneric } from "../../command/commands/args/type-command-args-generic";
import { HandlerFunction, HandlerSyncType } from "../handler-function/type";

/**
 * @description A handler that can be composed with other handlers by `composeHandlers`. It is basically a function along with the names of the commands it supports.
 */
export interface ComposableHandler<
  TArgs extends CommandArgs = CommandArgsGeneric<never, never>,
  TNames extends readonly string[] = readonly string[],
  TType extends HandlerSyncType = HandlerSyncType,
  TReturn = unknown,
> {
  handle: HandlerFunction<TArgs, TType, TReturn>;
  supports: TNames;
}
