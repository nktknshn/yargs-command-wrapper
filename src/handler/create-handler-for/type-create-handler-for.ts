import {
  Command,
  CommandComposed,
  CommandComposedWithSubcommands,
} from "../../command";
import {
  CommandsFlattenList,
  GetCommandName,
} from "../../command/commands/composed/type-helpers";
import { GetNestedComposedCommand } from "../../command/commands/with-subcommands/type-helpers";
import { EmptyRecord } from "../../common/types";
import { Cast, TupleKeys } from "../../common/types-util";
import { ComposableHandlerFor } from "../handler-composable/composable-handler-for";
import { ComposableHandler } from "../handler-composable/type";
import { HandlerFunction, HandlerSyncType } from "../handler-function/type";
import { InputHandlerFunctionFor } from "./type-input-function";

export type InputRecordHandler = {
  [key: string]: HandlerFunction | InputRecordHandler | ComposableHandler;
};

/**
 * @description defines a record that can be used to create a handler for a composed command or a command with subs.
 */
export type InputHandlerRecordFor<
  TCommand extends Command,
  TGlobalArgv extends EmptyRecord = EmptyRecord,
> =
  // Record for CommandComposed
  TCommand extends CommandComposed<infer TCommands, infer TArgv>
    ? InputHandlerRecordForCommands<TCommands, TGlobalArgv & TArgv>
    // Record for CommandComposedWithSubcommands
    : TCommand extends CommandComposedWithSubcommands<
      string,
      infer TCommands,
      infer TArgv,
      infer TCommandArgv
    >
    // For CommandComposedWithSubcommands the record defines handlers for the subcommands
      ? InputHandlerRecordForCommands<
        TCommands,
        TGlobalArgv & TCommandArgv & TArgv
      >
    : never;

type A = InputHandlerRecordFor<Command>;

/**
 * @description defines a record that can be used to create a handler for a list of commands.
 */
export type InputHandlerRecordForCommands<
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TCommands extends readonly Command[],
  TGlobalArgv extends EmptyRecord,
> = CommandsFlattenList<TCommands> extends infer TCommands ? {
    [
      // key is the name of the command
      P in TupleKeys<TCommands> as GetCommandName<
        Cast<TCommands[P], Command>
      >
    ]:
      // the value is a function
      | InputHandlerFunctionFor<
        Cast<TCommands[P], Command>,
        TGlobalArgv
      >
      // the value is another record
      | InputHandlerRecordFor<
        Cast<TCommands[P], Command>,
        TGlobalArgv
      >
      // the value is a ComposableHandler
      | ComposableHandlerFor<
        Cast<TCommands[P], Command>,
        HandlerSyncType,
        unknown,
        TGlobalArgv
      >
      // the value is a ComposableHandler for subcommands of a command with subcommands
      | ComposableHandlerForSubcommands<
        Cast<TCommands[P], Command>,
        TGlobalArgv
      >;
  }
  : never;

/**
 * @description handler for a command with subcommands can be created from a composable handler for the subcommands.
 */
export type ComposableHandlerForSubcommands<
  TCommand extends Command,
  TGlobalArgv extends EmptyRecord = EmptyRecord,
> = TCommand extends CommandComposedWithSubcommands ? ComposableHandlerFor<
    GetNestedComposedCommand<TCommand>,
    HandlerSyncType,
    unknown,
    TGlobalArgv
  >
  : never;

type B = ComposableHandlerForSubcommands<Command>;
