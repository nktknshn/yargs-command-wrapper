import {
  Command,
  CommandBasic,
  CommandComposed,
  CommandComposedWithSubcommands,
} from "../../command";
import {
  CommandArgsSelfHandle,
} from "../../command/commands/args/type-command-args";
import {
  GetCommandArgv,
  IsSelfHandled,
} from "../../command/commands/type-helpers";
import { EmptyRecord } from "../../common/types";
import { HandlerFunction } from "../handler-function/type";
import {
  HandlerFunctionFor,
} from "../handler-function/type-handler-function-for";
import { HandlerFunctionExtendArgs } from "../handler-function/type-helpers";

/**
 * @description Function that is used to create a handler for a command.
 *
 * For a basic command it is: `(argv: TArgv) => TResult`
 *
 * For a composed command it is: `(args: Command1Args<TArgv1> | Command2Args<TArgv2>...) => TResult`
 *
 * For a command with subcommands it is: `(args: Command1Args<TArgv1> | Command2Args<TArgv2>...) => TResult`
 */
export type InputHandlerFunctionFor<
  TCommand extends Command,
  TGlobalArgv extends EmptyRecord = EmptyRecord,
> =
  /**
   * for a basic command, the handler is a function that receives argv (command name is not included)
   */
  TCommand extends CommandBasic<string, infer TArgv>
    ? HandlerFunction<TArgv & TGlobalArgv>
    /**
     * handler for a composed command is defined by a function that receives argv and command name which is a union of composed commands names
     */
    : TCommand extends CommandComposed
      ? HandlerFunctionFor<TCommand, TGlobalArgv>
    /**
     * handler for a command with subcommands is defined by a handler of the nested composed command
     */
    : TCommand extends CommandComposedWithSubcommands
      ? HandlerFunctionExtendArgs<
        HandlerFunctionFor<TCommand["subcommands"], TGlobalArgv>,
        IsSelfHandled<TCommand> extends true
          ? CommandArgsSelfHandle<GetCommandArgv<TCommand> & TGlobalArgv>
          : never
      >
    : never;
