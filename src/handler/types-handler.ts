import {
  BasicCommand,
  Command,
  CommandWithSubcommands,
  ComposedCommands,
} from "../command/";
import { GetCommandParseResult } from "../command/";
import { PushCommand } from "../command/commands/with-subcommands/type-push-command";
import { Cast, Last } from "../common/types-util";

/**
 * @description CommandArgs is the type of the argument that is passed to the handler
 */
export type CommandArgs<TArgv extends {} = {}> = {
  "command": string;
  "argv": TArgv;
};

export type NestedCommandArgs<TArgv extends {} = {}> = {
  "subcommand": string;
  "command": string;
  "argv": TArgv;
};

export type HandlerSyncType = "sync" | "async";

/**
 * @description handler for a command. It's just a function that receives Argv
 */
export type BaseHandlerFunction<
  TArgv extends {},
  TType extends HandlerSyncType = "sync",
  TReturn = void,
> = TType extends "sync" ? ((argv: TArgv) => TReturn)
  : ((argv: TArgv) => Promise<TReturn>);

/**
 * @description handler for a composed command. It receives { command; argv }
 */
export type HandlerFunctionForComposed<
  TArgs extends CommandArgs,
  TType extends HandlerSyncType = "sync",
  TReturn = void,
> = BaseHandlerFunction<TArgs, TType, TReturn>;

export type HandlerFunction =
  | BaseHandlerFunction<any>
  | HandlerFunctionForComposed<any>;

type HandlerFunctionForBasic<
  TCommand extends BasicCommand,
  TGlobalArgv extends {} = {},
  TType extends HandlerSyncType = "sync",
> = TCommand extends BasicCommand<infer TName, infer TArgv>
  ? BaseHandlerFunction<{ command: TName; argv: TArgv & TGlobalArgv }, TType>
  : never;

type GetHandlerFunctionForComposed<
  TCommand extends ComposedCommands,
  TGlobalArgv extends {} = {},
  TType extends HandlerSyncType = "sync",
> = TCommand extends ComposedCommands<infer TCommands, infer TArgv>
  ? HandlerFunctionForComposed<
    GetCommandParseResult<ComposedCommands<TCommands, TArgv & TGlobalArgv>>,
    TType
  >
  : never;

type HandlerFunctionForSubcommands<
  TCommand extends CommandWithSubcommands,
  TGlobalArgv extends {} = {},
  TType extends HandlerSyncType = "sync",
> = TCommand extends CommandWithSubcommands<
  infer TName,
  infer TCommands,
  infer TArgv,
  infer TCommandArgv
> ? HandlerFunctionForComposed<
    PushCommand<
      GetCommandParseResult<
        ComposedCommands<TCommands, TArgv & TCommandArgv>
      >,
      TName,
      TGlobalArgv
    >,
    TType
  >
  : never;

/**
 * Returns type of the function that will handle arguments returned after parsing by `TCommand`
 */
export type HandlerFunctionFor<
  TCommand extends Command,
  TType extends HandlerSyncType = "sync",
  TGlobalArgv extends {} = {},
> =
  // or `BasicCommand` this is just a function takes `TArgv` and returns `void`
  TCommand extends BasicCommand
    ? HandlerFunctionForBasic<TCommand, TGlobalArgv, TType>
    : TCommand extends ComposedCommands
      ? GetHandlerFunctionForComposed<TCommand, TGlobalArgv, TType>
    : TCommand extends CommandWithSubcommands
      ? HandlerFunctionForSubcommands<TCommand, TGlobalArgv, TType>
    : never;

/**
 * Gets the type that will be returned by a handlers defined by the input `HandlersRecord`
 */
export type GetHandlersRecordReturnType<T extends HandlersRecord> = {
  [K in Extract<keyof T, string>]: T[K] extends
    HandlerFunctionForComposed<infer TArgs>
    ? PushCommand<TArgs, Cast<K, string>, {}>
    : T[K] extends BaseHandlerFunction<infer TArgv>
      ? { "command": K; argv: TArgv }
    : never;
}[Extract<keyof T, string>];

type TypeError<TMessage extends string> = TMessage;

export type HandlersRecord = Record<string, HandlerFunction>;
export type IsHandlersRecord<T extends HandlersRecord> = T extends
  Record<string, BaseHandlerFunction<any> | HandlerFunctionForComposed<any>>
  ? {}
  : TypeError<"Invalid input object">;

type GetLastHandlersType<T extends HandlersRecord> =
  T[Cast<Last<(keyof T)>, keyof T>] extends infer A
    ? GetHandlerSyncType<Cast<A, HandlerFunction>>
    : never;

export type GetHandlersRecordType<T extends HandlersRecord> =
  GetHandlerSyncType<
    T[keyof T]
  >;

export type GetFunctionSyncType<T extends (...args: any[]) => any> = T extends (
  ...args: any[]
) => infer R ? R extends Promise<any> ? "async" : "sync"
  : never;

export type GetFunctionReturnType<T extends (...args: any[]) => any> =
  ReturnType<T> extends Promise<infer R> ? R : ReturnType<T>;

export type GetHandlerSyncType<T extends HandlerFunction> = GetFunctionSyncType<
  T
>;

export type IsSameHandlersType<T extends HandlersRecord> =
  GetLastHandlersType<T> extends infer A
    ? GetHandlerSyncType<T[keyof T]> extends A ? {}
    : TypeError<"Handlers must be all sync or all async">
    : never;
