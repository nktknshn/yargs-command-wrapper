import {
  Command,
  CommandBasic,
  CommandComposed as CommandComposed,
  CommandComposedWithSubcommands as CommandComposedWithSubcommands,
  GetCommandParseResult,
} from "../../command";
import {
  BaseHandlerFunction,
  HandlerFunctionForComposed,
  HandlerSyncType,
} from "../types-handler";

// function handler

export type InputHandlerBasicCommandFunc<
  TCommand extends CommandBasic,
  TGlobalArgv extends {} = {},
  TType extends HandlerSyncType = HandlerSyncType,
  TReturn = unknown,
> = TCommand extends CommandBasic<infer TName, infer TArgv>
  ? BaseHandlerFunction<TArgv & TGlobalArgv, TType, TReturn>
  : never;

export type InputHandlerCommandComposedFunc<
  TCommand extends CommandComposed,
  TGlobalArgv extends {} = {},
  TType extends HandlerSyncType = HandlerSyncType,
  TReturn = unknown,
> = TCommand extends CommandComposed<infer TCommands, infer TArgv>
  ? HandlerFunctionForComposed<
    GetCommandParseResult<CommandComposed<TCommands, TArgv & TGlobalArgv>>,
    TType,
    TReturn
  >
  : never;

export type InputHandlerCommandWithSubcommandsFunc<
  TCommand extends CommandComposedWithSubcommands,
  TGlobalArgv extends {} = {},
  TType extends HandlerSyncType = HandlerSyncType,
  TReturn = unknown,
> = TCommand extends CommandComposedWithSubcommands<
  infer TName,
  infer TCommands,
  infer TArgv,
  infer TComposedArgv
> ? HandlerFunctionForComposed<
    GetCommandParseResult<
      CommandComposed<TCommands, TArgv & TGlobalArgv & TComposedArgv>
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
> = TCommand extends CommandBasic
  ? InputHandlerBasicCommandFunc<TCommand, TGlobalArgv, THandlerType, TReturn>
  : TCommand extends CommandComposed ? InputHandlerCommandComposedFunc<
      TCommand,
      TGlobalArgv,
      THandlerType,
      TReturn
    >
  : TCommand extends CommandComposedWithSubcommands
    ? InputHandlerCommandWithSubcommandsFunc<
      TCommand,
      TGlobalArgv,
      THandlerType,
      TReturn
    >
  : never;
