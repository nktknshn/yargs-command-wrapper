import {
  BasicCommand,
  Command,
  CommandWithSubcommands,
  ComposedCommands,
  GetCommandParseResult,
} from "../../command";

import {
  BaseHandlerFunction,
  GetFunctionReturnType,
  GetFunctionSyncType,
  GetHandlerSyncType,
  HandlerFunction,
  HandlerFunctionForComposed,
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

type GetInputRecordHandlerForReturnType<
  T extends InputRecordHandler,
> = {
  [K in keyof T]: T[K] extends HandlerFunction ? GetFunctionReturnType<T[K]>
    : T[K] extends ComposableHandler ? GetFunctionReturnType<T[K]["handle"]>
    : T[K] extends InputRecordHandler ? GetInputRecordHandlerForReturnType<T[K]>
    : never;
}[keyof T];

/**
 * @description defines a record that can be used to define a handler for a command.
 */
export type InputHandlerRecordFor<
  TCommand extends Command | readonly Command[],
  TGlobalArgv extends {} = {},
  THandlerType extends HandlerSyncType = HandlerSyncType,
  TReturn = unknown,
> = TCommand extends ComposedCommands
  ? InputRecordForComposedCommands<TCommand, TGlobalArgv, THandlerType>
  : TCommand extends CommandWithSubcommands<
    infer TName,
    infer TCommands,
    infer TArgv,
    infer TCommandArgv
  > ? InputRecordForComposedCommands<
      ComposedCommands<TCommands, TArgv & TCommandArgv & TGlobalArgv>,
      TGlobalArgv,
      THandlerType,
      TReturn
    >
  : never;

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

export type InputHandlerForSubcommands<
  TCommand extends CommandWithSubcommands,
  TGlobalArgv extends {} = {},
  TType extends HandlerSyncType = HandlerSyncType,
  TReturn = unknown,
> = TCommand extends CommandWithSubcommands<
  infer TName,
  infer TCommands,
  infer TArgv,
  infer TCommandArgv
> ? ComposableHandlerFor<
    ComposedCommands<TCommands, TArgv & TCommandArgv>,
    TType,
    TGlobalArgv,
    TReturn
  >
  : never;

export type InputHandlerBasicCommandFunc<
  TCommand extends BasicCommand,
  TGlobalArgv extends {} = {},
  TType extends HandlerSyncType = HandlerSyncType,
  TReturn = unknown,
> = TCommand extends BasicCommand<infer TName, infer TArgv>
  ? BaseHandlerFunction<TArgv & TGlobalArgv, TType, TReturn>
  : never;

export type InputHandlerComposedCommandFunc<
  TCommand extends ComposedCommands,
  TGlobalArgv extends {} = {},
  TType extends HandlerSyncType = HandlerSyncType,
  TReturn = unknown,
> = TCommand extends ComposedCommands<infer TCommands, infer TArgv>
  ? HandlerFunctionForComposed<
    GetCommandParseResult<ComposedCommands<TCommands, TArgv & TGlobalArgv>>,
    TType,
    TReturn
  >
  : never;

export type InputHandlerCommandWithSubcommandsFunc<
  TCommand extends CommandWithSubcommands,
  TGlobalArgv extends {} = {},
  TType extends HandlerSyncType = HandlerSyncType,
  TReturn = unknown,
> = TCommand extends CommandWithSubcommands<
  infer TName,
  infer TCommands,
  infer TArgv,
  infer TComposedArgv
>
  //
  ? HandlerFunctionForComposed<
    GetCommandParseResult<
      ComposedCommands<TCommands, TArgv & TGlobalArgv & TComposedArgv>
    >,
    TType,
    TReturn
  >
  : never;

export type InputHandlerFunctionFor<
  TCommand extends Command,
  TGlobalArgv extends {} = {},
  THandlerType extends HandlerSyncType = HandlerSyncType,
  TReturn = unknown,
> = TCommand extends BasicCommand
  ? InputHandlerBasicCommandFunc<TCommand, TGlobalArgv, THandlerType, TReturn>
  : TCommand extends ComposedCommands ? InputHandlerComposedCommandFunc<
      TCommand,
      TGlobalArgv,
      THandlerType,
      TReturn
    >
  : TCommand extends CommandWithSubcommands
    ? InputHandlerCommandWithSubcommandsFunc<
      TCommand,
      TGlobalArgv,
      THandlerType,
      TReturn
    >
  : never;

export type InputRecordForComposedCommands<
  TCommand extends ComposedCommands,
  TGlobalArgv extends {},
  THandlerType extends HandlerSyncType,
  TReturn = unknown,
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
        THandlerType,
        TReturn
      >
      // the value is another handler
      | ComposableHandlerFor<
        Cast<TCommands[P], Command>,
        THandlerType,
        TArgv & TGlobalArgv,
        TReturn
      >
      // the value is a record
      | InputHandlerRecordFor<
        Cast<TCommands[P], Command>,
        TArgv & TGlobalArgv,
        THandlerType,
        TReturn
      >;
  }
  : never;
