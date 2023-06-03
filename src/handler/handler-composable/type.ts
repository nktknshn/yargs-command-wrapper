import { CommandArgs } from "../../command/commands/args/type-command-args";
import { CommandArgsGeneric } from "../../command/commands/args/type-command-args-generic";
import { HandlerFunction, HandlerSyncType } from "../handler-function/type";

/**
 * @description A handler that can be composed with other handlers by `composeHandlers`. It is basically a function along with the names of the commands it supports.
 */
export interface ComposableHandler<
  TNames extends readonly string[] = readonly string[],
  TArgs extends CommandArgs = CommandArgsGeneric<never, never>,
  // TArgs extends CommandArgs = any,
  TType extends HandlerSyncType = HandlerSyncType,
  TReturn = unknown,
> {
  handle: HandlerFunction<TArgs, TType, TReturn>;
  supports: TNames;
}

type A = ComposableHandler<
  ["a"],
  { command: string; argv: { a: number } },
  "sync",
  void
>;

type CC = HandlerFunction;
type B = A extends ComposableHandler ? true : false;

type TC = { command: "a"; argv: { a: number } } extends CommandArgs ? true
  : false;
