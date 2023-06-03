import {
  Command,
  CommandBasic,
  CommandComposed,
  CommandComposedWithSubcommands,
  GetCommandParseResult,
} from "../../command";
import { EmptyRecord } from "../../common/types";
import { Equal, FallbackToNever, FallbackType } from "../../common/types-util";
import { HandlerFunction } from "./type";

export type DefaultHandler<TCommand extends Command> =
  Equal<TCommand, Command> extends true ? 
      | HandlerFunction<{ command: never; argv: never }>
      | HandlerFunction<{ command: never; argv: never }>
      | HandlerFunction<{ subcommand: never; command: never; argv: never }>
    : Equal<TCommand, CommandBasic> extends true
      ? HandlerFunction<{ command: never; argv: never }>
    : Equal<TCommand, CommandComposed> extends true
      ? HandlerFunction<{ command: never; argv: never }>
    : Equal<TCommand, CommandComposedWithSubcommands> extends true
      ? HandlerFunction<{ subcommand: never; command: never; argv: never }>
    : never;

/**
 * @description Returns the type of the function that will handle arguments returned after parsing by `TCommand`
 */
export type HandlerFunctionFor<
  TCommand extends Command,
  TGlobalArgv extends EmptyRecord = EmptyRecord,
> = DefaultHandler<TCommand> extends never // or `BasicCommand` this is just a function takes `TArgv`
  ? TCommand extends CommandBasic<infer TName, infer TArgv>
    ? HandlerFunction<{ command: TName; argv: TArgv }>
  : TCommand extends CommandComposed ? HandlerFunction<
      GetCommandParseResult<TCommand, TGlobalArgv>
    >
  : TCommand extends CommandComposedWithSubcommands ? HandlerFunction<
      GetCommandParseResult<TCommand, TGlobalArgv>
    >
  : never
  : DefaultHandler<TCommand>;
