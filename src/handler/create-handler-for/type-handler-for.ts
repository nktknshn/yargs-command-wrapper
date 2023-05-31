import {
  Command,
  CommandComposed,
  CommandComposedWithSubcommands,
} from "../../command";

import { HandlerFunction, HandlerSyncType } from "../types-handler-function";

import {
  CommandsFlattenList,
  GetCommandName,
} from "../../command/commands/composed/type-helpers";
import { Cast, TupleKeys } from "../../common/types-util";
import { ComposableHandler, ComposableHandlerFor } from "../types-compose";
import { InputHandlerFunctionFor } from "./type-input-function";

export type InputRecordHandler = {
  [key: string]: HandlerFunction | InputRecordHandler | ComposableHandler;
};

/**
 * @description defines a record that can be used to define a handler for a composed command or a command with subs.
 */
export type InputHandlerRecordFor<
  TCommand extends Command,
  TGlobalArgv extends {} = {},
> =
  // Record for CommandComposed
  TCommand extends CommandComposed<infer TCommands, infer TArgv>
    ? InputHandlerRecordForCommands<TCommands, TGlobalArgv & TArgv>
    // Record for CommandComposedWithSubcommands
    : TCommand extends CommandComposedWithSubcommands<
      infer TName,
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

export type InputHandlerRecordForCommands<
  TCommands extends readonly Command[],
  TGlobalArgv extends {},
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
  TGlobalArgv extends {} = {},
> = TCommand extends CommandComposedWithSubcommands<
  infer TName,
  infer TCommands,
  infer TArgv,
  infer TCommandArgv
> ? ComposableHandlerFor<
    CommandComposed<TCommands, TGlobalArgv & TArgv & TCommandArgv>
  >
  : never;
