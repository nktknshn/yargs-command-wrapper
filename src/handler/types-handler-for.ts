import {
  BasicCommand,
  Command,
  CommandWithSubcommands,
  ComposedCommands,
  GetCommandReturnType,
  PushCommand,
} from "../types";

import {
  BaseHandlerFunction,
  CommandArgs,
  HandlerFunction,
  HandlerFunctionForCompose,
  HandlerType,
} from "./types-handler";

import { ComposedCommandsInputRecord } from "./types-compose";

export interface BasicHandlerComposable<
  TName extends string,
  TArgv extends {},
> {
  handle(argv: TArgv): void;
  supports: TName[];
}

export interface ComposedHandlerComposable<
  TNames extends readonly string[],
  TArgv extends CommandArgs,
> {
  handle(argv: TArgv): void;
  supports: TNames;
}

export type ComposableHandler =
  | BasicHandlerComposable<string, any>
  | ComposedHandlerComposable<readonly string[], any>;

export type InputRecordHandler = {
  [key: string]: HandlerFunction | InputRecordHandler | ComposableHandler;
};

export type InputHandlerBasicCommandFunc<
  TCommand extends BasicCommand,
  TGlobalArgv extends {} = {},
  TType extends HandlerType = "sync",
> = TCommand extends BasicCommand<infer TName, infer TArgv>
  ? BaseHandlerFunction<TArgv & TGlobalArgv, TType>
  : never;

export type InputHandlerComposedCommandFunc<
  TCommand extends ComposedCommands,
  TGlobalArgv extends {} = {},
  TType extends HandlerType = "sync",
> = TCommand extends ComposedCommands<infer TCommands, infer TArgv>
  ? HandlerFunctionForCompose<
    GetCommandReturnType<ComposedCommands<TCommands, TArgv & TGlobalArgv>>,
    TType
  >
  : never;

export type InputHandlerCommandWithSubcommandsFunc<
  TCommand extends CommandWithSubcommands,
  TGlobalArgv extends {} = {},
  TType extends HandlerType = "sync",
> = TCommand extends CommandWithSubcommands<
  infer TName,
  infer TCommands,
  infer TArgv,
  infer TComposedArgv
>
  //
  ? HandlerFunctionForCompose<
    GetCommandReturnType<
      ComposedCommands<TCommands, TArgv & TGlobalArgv & TComposedArgv>
    >,
    TType
  >
  // ? ComposedHandler<
  //   PushCommand<
  //     GetCommandReturnType<ComposedCommands<TCommands, TArgv & TComposedArgv>>,
  //     TName,
  //     TGlobalArgv
  //   >,
  //   TType
  // >
  : never;

export type InputHandlerFunctionFor<
  TCommand extends Command,
  TGlobalArgv extends {} = {},
  THandlerType extends HandlerType = "sync",
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

export type InputRecordHandlerFor<
  TCommand extends Command | readonly Command[],
  // `TGlobalArgv` is object to intersect with `TArgv` of `TCommand`
  TGlobalArgv extends {} = {},
> = TCommand extends ComposedCommands
  ? ComposedCommandsInputRecord<TCommand, TGlobalArgv>
  : TCommand extends CommandWithSubcommands<
    infer TName,
    infer TCommands,
    infer TArgv,
    infer TCommandArgv
  > ? ComposedCommandsInputRecord<
      ComposedCommands<TCommands, TArgv & TCommandArgv & TGlobalArgv>,
      TGlobalArgv
    >
  : never;
