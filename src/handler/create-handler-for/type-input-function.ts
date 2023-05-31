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
} from "../types-handler-function";

// function handler

/**
 * @description function that is used to create a handler for a command.
 */
export type InputHandlerFunctionFor<
  TCommand extends Command,
  TGlobalArgv extends {} = {},
> =
  //
  TCommand extends CommandBasic
    ? InputHandlerFunctionForBasic<TCommand, TGlobalArgv>
    //
    : TCommand extends CommandComposed ? InputHandlerFunctionForComposed<
        TCommand,
        TGlobalArgv
      >
    //
    : TCommand extends CommandComposedWithSubcommands
      ? InputHandlerFunctionForSubcommands<
        TCommand,
        TGlobalArgv
      >
    : never;

type InputHandlerFunctionForBasic<
  TCommand extends CommandBasic,
  TGlobalArgv extends {} = {},
> = TCommand extends CommandBasic<infer TName, infer TArgv>
  ? BaseHandlerFunction<TArgv & TGlobalArgv>
  : never;

type InputHandlerFunctionForComposed<
  TCommand extends CommandComposed,
  TGlobalArgv extends {} = {},
> = TCommand extends CommandComposed<infer TCommands, infer TArgv>
  ? HandlerFunctionForComposed<
    GetCommandParseResult<CommandComposed<TCommands, TArgv & TGlobalArgv>>
  >
  : never;

type InputHandlerFunctionForSubcommands<
  TCommand extends CommandComposedWithSubcommands,
  TGlobalArgv extends {} = {},
> = TCommand extends CommandComposedWithSubcommands<
  infer TName,
  infer TCommands,
  infer TArgv,
  infer TComposedArgv
> ? HandlerFunctionForComposed<
    GetCommandParseResult<
      CommandComposed<TCommands, TArgv & TGlobalArgv & TComposedArgv>
    >
  >
  : never;
