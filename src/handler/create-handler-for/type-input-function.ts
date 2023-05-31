import {
  Command,
  CommandBasic,
  CommandComposed,
  CommandComposedWithSubcommands,
  GetCommandParseResult,
} from "../../command";
import { GetNestedComposedCommand } from "../../command/commands/with-subcommands/type-helpers";
import { HandlerFunction } from "../handler-function/type";
import { HandlerFunctionFor } from "../handler-function/type-handler-function-for";

/**
 * @description function that is used to create a handler for a command.
 */
export type InputHandlerFunctionFor<
  TCommand extends Command,
  TGlobalArgv extends {} = {},
> =
  /**
   * for a basic command, the handler is a function that receives argv (command name is not included)
   */
  TCommand extends CommandBasic<infer TName, infer TArgv>
    ? HandlerFunction<TArgv & TGlobalArgv>
    /**
     * handler for a composed command is defined by a function that receives argv and command name which is a union of composed commands names
     */
    : TCommand extends CommandComposed
      ? HandlerFunctionFor<TCommand, TGlobalArgv>
    /**
     * handler for a command with subcommands is defined by a handler of the nested composed command
     */
    : TCommand extends CommandComposedWithSubcommands ? HandlerFunctionFor<
        GetNestedComposedCommand<TCommand>,
        TGlobalArgv
      >
    : never;
