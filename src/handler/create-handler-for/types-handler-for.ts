import {
  Command,
  CommandComposed as CommandComposed,
  CommandComposedWithSubcommands as CommandComposedWithSubcommands,
} from "../../command";

import {
  GetFunctionReturnType,
  GetFunctionSyncType,
  GetHandlerSyncType,
  HandlerFunction,
  HandlerSyncType,
} from "../types-handler";

import {
  ComposeCommandsFlatten,
  GetCommandName,
} from "../../command/commands/composed/type-helpers";
import { Cast, TupleKeys } from "../../common/types-util";
import {
  ComposableHandler,
  ComposableHandlerFor,
  GetComposableHandlerReturnType,
  GetComposableHandlerSyncType,
} from "../types-compose";
import { InputHandlerFunctionFor } from "./InputHandlerFunctionFor";

export type InputRecordHandler = {
  [key: string]: HandlerFunction | InputRecordHandler | ComposableHandler;
};

/**
 * @description defines a record that can be used to define a handler for a composed command or a command with subs.
 */
export type InputHandlerRecordFor<
  TCommand extends Command,
  TGlobalArgv extends {} = {},
> = TCommand extends CommandComposed
  ? InputHandlerRecordForComposedCommands<TCommand, TGlobalArgv>
  : TCommand extends CommandComposedWithSubcommands<
    infer TName,
    infer TCommands,
    infer TArgv,
    infer TCommandArgv
  > ? InputHandlerRecordForComposedCommands<
      CommandComposed<TCommands, TArgv & TCommandArgv & TGlobalArgv>,
      TGlobalArgv
    >
  : never;

export type InputHandlerRecordForComposedCommands<
  TCommand extends CommandComposed,
  TGlobalArgv extends {},
> = ComposeCommandsFlatten<TCommand> extends CommandComposed<
  infer TCommands,
  infer TArgv
> ? {
    [
      // key is the name of the command
      P in TupleKeys<TCommands> as GetCommandName<
        Cast<TCommands[P], Command>
      >
    ]:
      // the value is a function
      | InputHandlerFunctionFor<
        Cast<TCommands[P], Command>,
        TArgv & TGlobalArgv
      >
      // the value is another record
      | InputHandlerRecordFor<
        Cast<TCommands[P], Command>,
        TArgv & TGlobalArgv
      >
      | InputHandlerForSubcommands<Cast<TCommands[P], Command>>
      | ComposableHandlerFor<Cast<TCommands[P], Command>>;
  }
  : never;

/**
 * @description handler for a command with subcommands can be created from a composable handler for the subcommands.
 */
export type InputHandlerForSubcommands<
  TCommand extends Command,
> = TCommand extends CommandComposedWithSubcommands<
  infer TName,
  infer TCommands,
  infer TArgv,
  infer TCommandArgv
> ? ComposableHandlerFor<
    CommandComposed<TCommands, TArgv & TCommandArgv>
  >
  : never;

// helpers

type GetInputRecordHandlerForSyncType<
  T extends InputRecordHandler,
> = {
  [K in keyof T]: T[K] extends HandlerFunction ? GetFunctionSyncType<T[K]>
    : T[K] extends ComposableHandler ? GetFunctionSyncType<T[K]["handle"]>
    : T[K] extends InputRecordHandler ? GetInputRecordHandlerForSyncType<T[K]>
    : never;
}[keyof T];

type GetInputRecordHandlerForReturnType<
  T extends InputRecordHandler,
> = {
  [K in keyof T]: T[K] extends HandlerFunction ? GetFunctionReturnType<T[K]>
    : T[K] extends ComposableHandler ? GetFunctionReturnType<T[K]["handle"]>
    : T[K] extends InputRecordHandler ? GetInputRecordHandlerForReturnType<T[K]>
    : never;
}[keyof T];

export type GetSyncType<
  T extends
    | InputHandlerFunctionFor<Command>
    | InputHandlerRecordFor<Command>
    | ComposableHandler,
> = T extends InputHandlerFunctionFor<Command, any, infer TType>
  ? GetHandlerSyncType<T>
  : T extends InputRecordHandler ? GetInputRecordHandlerForSyncType<T>
  : T extends ComposableHandler ? GetComposableHandlerSyncType<T>
  : never;

export type GetReturnType<
  T extends
    | InputHandlerFunctionFor<Command>
    | InputHandlerRecordFor<Command>
    | ComposableHandler,
> = T extends InputHandlerFunctionFor<Command, any, infer TType>
  ? GetFunctionReturnType<T>
  : T extends InputRecordHandler ? GetInputRecordHandlerForReturnType<T>
  : T extends ComposableHandler ? GetComposableHandlerReturnType<T>
  : never;
