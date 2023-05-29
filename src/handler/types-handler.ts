import {
  BasicCommand,
  Command,
  CommandWithSubcommands,
  ComposedCommands,
  FallbackNever,
  GetCommandReturnType,
  PushCommand,
} from "../types";
import { Cast, Last } from "../util";

export type CommandArgs<TArgv extends {} = {}> =
  | { "command": string; "argv": TArgv }
  | NestedCommandArgs<TArgv>;

export type NestedCommandArgs<TArgv extends {} = {}> = {
  "subcommand": string;
  "command": string;
  "argv": TArgv;
};

export type HandlerType = "sync" | "async";

/**
 * @description handler for a command. It's just a function that receives Argv
 */
export type BaseHandlerFunction<TArgv, TType extends HandlerType = "sync"> =
  TType extends "sync" ? ((argv: TArgv) => void)
    : ((argv: TArgv) => Promise<void>);

/**
 * @description handler for a composed command. It receives { command; argv }
 */
export type HandlerFunctionForCompose<
  TArgs extends CommandArgs,
  TType extends HandlerType = "sync",
> = BaseHandlerFunction<TArgs, TType>;

export type HandlerFunction =
  | BaseHandlerFunction<any>
  | HandlerFunctionForCompose<any>;

type HandlerFunctionForBasic<
  TCommand extends BasicCommand,
  TGlobalArgv extends {} = {},
  TType extends HandlerType = "sync",
> = TCommand extends BasicCommand<infer TName, infer TArgv>
  ? BaseHandlerFunction<{ command: TName; argv: TArgv & TGlobalArgv }, TType>
  : never;

type HandlerFunctionForComposed<
  TCommand extends ComposedCommands,
  TGlobalArgv extends {} = {},
  TType extends HandlerType = "sync",
> = TCommand extends ComposedCommands<infer TCommands, infer TArgv>
  ? HandlerFunctionForCompose<
    GetCommandReturnType<ComposedCommands<TCommands, TArgv & TGlobalArgv>>,
    TType
  >
  : never;

type HandlerFunctionForSubcommands<
  TCommand extends CommandWithSubcommands,
  TGlobalArgv extends {} = {},
  TType extends HandlerType = "sync",
> = TCommand extends CommandWithSubcommands<
  infer TName,
  infer TCommands,
  infer TArgv,
  infer TCommandArgv
> ? HandlerFunctionForCompose<
    PushCommand<
      GetCommandReturnType<
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
  TType extends HandlerType = "sync",
  TGlobalArgv extends {} = {},
> =
  // or `BasicCommand` this is just a function takes `TArgv` and returns `void`
  TCommand extends BasicCommand
    ? HandlerFunctionForBasic<TCommand, TGlobalArgv, TType>
    : TCommand extends ComposedCommands
      ? HandlerFunctionForComposed<TCommand, TGlobalArgv, TType>
    : TCommand extends CommandWithSubcommands
      ? HandlerFunctionForSubcommands<TCommand, TGlobalArgv, TType>
    : never;

/**
 * Gets the type that will be returned by a handlers defined by the input `HandlersRecord`
 */
export type GetHandlersRecordReturnType<T extends HandlersRecord> =
  FallbackNever<
    {
      [K in Extract<keyof T, string>]: T[K] extends
        HandlerFunctionForCompose<infer TArgs>
        ? PushCommand<TArgs, Cast<K, string>, {}>
        : T[K] extends BaseHandlerFunction<infer TArgv>
          ? { "command": K; argv: TArgv }
        : never;
    }[Extract<keyof T, string>],
    CommandArgs
  >;

type TypeError<TMessage extends string> = TMessage;

export type HandlersRecord = Record<string, HandlerFunction>;
export type IsHandlersRecord<T extends HandlersRecord> = T extends
  Record<string, BaseHandlerFunction<any> | HandlerFunctionForCompose<any>> ? {}
  : TypeError<"Invalid input object">;
type GetLastHandlersType<T extends HandlersRecord> =
  T[Cast<Last<(keyof T)>, keyof T>] extends infer A
    ? GetHandlerType<Cast<A, HandlerFunction>>
    : never;

export type GetHandlersRecordType<T extends HandlersRecord> = GetHandlerType<
  T[keyof T]
>;

export type GetHandlerType<T extends HandlerFunction> = ReturnType<T> extends
  infer A ? A extends Promise<any> ? "async" : "sync" : never;

export type IsSameHandlersType<T extends HandlersRecord> =
  GetLastHandlersType<T> extends infer A
    ? GetHandlerType<T[keyof T]> extends A ? {}
    : TypeError<"Handlers must be all sync or all async">
    : never;
