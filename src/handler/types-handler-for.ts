import {
  BasicCommand,
  Command,
  CommandWithSubcommands,
  ComposedCommands,
  GetCommandReturnType,
} from "../types";

import {
  BaseHandlerFunction,
  GetFunctionSyncType,
  GetHandlerSyncType,
  HandlerFunction,
  HandlerFunctionForComposed,
  HandlerSyncType,
} from "./types-handler";

import { Cast, TupleKeys } from "../util";
import {
  ComposableHandler,
  ComposableHandlerFor,
  GetComposableHandlerSyncType,
} from "./types-compose";
import { ComposeCommandsFlatten, GetCommandName } from "./types-helpers";

export type InputRecordHandler = {
  [key: string]: HandlerFunction | InputRecordHandler | ComposableHandler;
};

type GetInputRecordHandlerForSyncType<
  T extends InputRecordHandler,
> = {
  [K in keyof T]: T[K] extends HandlerFunction ? GetFunctionSyncType<T[K]>
    : T[K] extends ComposableHandler ? GetFunctionSyncType<T[K]["handle"]>
    : T[K] extends InputRecordHandler ? GetInputRecordHandlerForSyncType<T[K]>
    : never;
}[keyof T];

export type InputRecordHandlerFor<
  TCommand extends Command | readonly Command[],
  TGlobalArgv extends {} = {},
  THandlerType extends HandlerSyncType = HandlerSyncType,
> = TCommand extends ComposedCommands
  ? ComposedCommandsInputRecord<TCommand, TGlobalArgv, THandlerType>
  : TCommand extends CommandWithSubcommands<
    infer TName,
    infer TCommands,
    infer TArgv,
    infer TCommandArgv
  > ? ComposedCommandsInputRecord<
      ComposedCommands<TCommands, TArgv & TCommandArgv & TGlobalArgv>,
      TGlobalArgv,
      THandlerType
    >
  : never;

export type GetSyncType<
  T extends
    | InputHandlerFunctionFor<Command>
    | InputRecordHandlerFor<Command>
    | ComposableHandler,
> = T extends InputHandlerFunctionFor<Command, any, infer TType>
  ? GetHandlerSyncType<T>
  : T extends InputRecordHandler ? GetInputRecordHandlerForSyncType<T>
  : T extends ComposableHandler ? GetComposableHandlerSyncType<T>
  : never;

export type InputSubcommandsHandlerFor<
  TCommand extends CommandWithSubcommands,
  TGlobalArgv extends {} = {},
  TType extends HandlerSyncType = HandlerSyncType,
> = TCommand extends CommandWithSubcommands<
  infer TName,
  infer TCommands,
  infer TArgv,
  infer TCommandArgv
> ? ComposableHandlerFor<
    ComposedCommands<TCommands, TArgv & TCommandArgv>,
    TType,
    TGlobalArgv
  >
  : never;

export type InputHandlerBasicCommandFunc<
  TCommand extends BasicCommand,
  TGlobalArgv extends {} = {},
  TType extends HandlerSyncType = HandlerSyncType,
> = TCommand extends BasicCommand<infer TName, infer TArgv>
  ? BaseHandlerFunction<TArgv & TGlobalArgv, TType>
  : never;

export type InputHandlerComposedCommandFunc<
  TCommand extends ComposedCommands,
  TGlobalArgv extends {} = {},
  TType extends HandlerSyncType = HandlerSyncType,
> = TCommand extends ComposedCommands<infer TCommands, infer TArgv>
  ? HandlerFunctionForComposed<
    GetCommandReturnType<ComposedCommands<TCommands, TArgv & TGlobalArgv>>,
    TType
  >
  : never;

export type InputHandlerCommandWithSubcommandsFunc<
  TCommand extends CommandWithSubcommands,
  TGlobalArgv extends {} = {},
  TType extends HandlerSyncType = HandlerSyncType,
> = TCommand extends CommandWithSubcommands<
  infer TName,
  infer TCommands,
  infer TArgv,
  infer TComposedArgv
>
  //
  ? HandlerFunctionForComposed<
    GetCommandReturnType<
      ComposedCommands<TCommands, TArgv & TGlobalArgv & TComposedArgv>
    >,
    TType
  >
  : never;

export type InputHandlerFunctionFor<
  TCommand extends Command,
  TGlobalArgv extends {} = {},
  THandlerType extends HandlerSyncType = HandlerSyncType,
> = TCommand extends BasicCommand
  ? InputHandlerBasicCommandFunc<TCommand, TGlobalArgv, THandlerType>
  : TCommand extends ComposedCommands
    ? InputHandlerComposedCommandFunc<TCommand, TGlobalArgv, THandlerType>
  : TCommand extends CommandWithSubcommands
    ? InputHandlerCommandWithSubcommandsFunc<
      TCommand,
      TGlobalArgv,
      THandlerType
    >
  : never;

export type ComposedCommandsInputRecord<
  TCommand extends ComposedCommands,
  TGlobalArgv extends {},
  THandlerType extends HandlerSyncType,
> = ComposeCommandsFlatten<TCommand> extends ComposedCommands<
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
        TArgv & TGlobalArgv,
        THandlerType
      >
      // the value is another handler
      | ComposableHandlerFor<
        Cast<TCommands[P], Command>,
        THandlerType,
        TArgv & TGlobalArgv
      >
      // the value is a record
      | InputRecordHandlerFor<
        Cast<TCommands[P], Command>,
        TArgv & TGlobalArgv,
        THandlerType
      >;
  }
  : never;
