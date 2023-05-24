import {
  AddCommand,
  BasicCommand,
  Command,
  CommandWithSubcommands,
  ComposedCommands,
  GetCommandNameFromDesc,
  GetCommandReturnType,
} from "./types";
import { Cast, isObjectWithOwnProperty, Last, TupleKeys } from "./util";

type PathToObject<TPath extends string, TPrefix extends string = ""> =
  TPath extends `/${infer TName}/${infer TRest}` ? 
      & Record<`${TPrefix}command`, TName>
      & PathToObject<`/${TRest}`, `sub${TPrefix}`>
    : {};

export type GetArgs<TArgs, TPath extends string> = TArgs extends unknown
  ? TArgs extends PathToObject<TPath> ? TArgs : never
  : never;

type CommandArgs = {
  "command": string;
  "argv": unknown;
};

export type HandlerType = "sync" | "async";

/**
 * handler for a basic command. It's just a function that receives Argv
 */
export type BasicHandler<TArgv, TType extends HandlerType = "sync"> =
  TType extends "sync" ? ((argv: TArgv) => void)
    : ((argv: TArgv) => Promise<void>);

/**
 * handler for a composed command. It receives { command; argv }
 */
export type ComposedHandler<
  TArgs extends CommandArgs,
  TType extends HandlerType = "sync",
> = TType extends "sync" ? ((args: TArgs) => void)
  : ((args: TArgs) => Promise<void>);

type Handler = BasicHandler<any> | ComposedHandler<any>;

type HandlersUnion<T extends {}> = {
  [K in Extract<keyof T, string>]: T[K] extends ComposedHandler<infer TArgs>
    ? AddCommand<TArgs, Cast<K, string>, {}>
    : T[K] extends BasicHandler<infer TArgv> ? { "command": K; argv: TArgv }
    : never;
}[Extract<keyof T, string>];

type TypeError<TMessage extends string> = TMessage;
type HandlersStruct = Record<string, Handler>;

type IsHandlersRecord<T extends HandlersStruct> = T extends
  Record<string, BasicHandler<any> | ComposedHandler<any>> ? {}
  : TypeError<"Invalid input object">;

type GetLastHandlersType<T extends HandlersStruct> =
  T[Cast<Last<(keyof T)>, keyof T>] extends infer A
    ? GetHandlerType<Cast<A, Handler>>
    : never;

type GetStructHandlersType<T extends HandlersStruct> = GetHandlerType<
  T[keyof T]
>;

type GetHandlerType<T extends Handler> = ReturnType<T> extends infer A
  ? A extends Promise<any> ? "async"
  : "sync"
  : never;

type IsSameHandlersType<T extends HandlersStruct> =
  GetLastHandlersType<T> extends infer A
    ? GetHandlerType<T[keyof T]> extends A ? {}
    : TypeError<"Handlers must be all sync or all async">
    : never;

export const createHandler = <TRec extends HandlersStruct>(
  record: TRec & IsHandlersRecord<TRec> & IsSameHandlersType<TRec>,
): ComposedHandler<HandlersUnion<TRec>, GetStructHandlersType<TRec>> =>
(args) => {
  const handler = record[args.command];

  if (isObjectWithOwnProperty(args, "subcommand")) {
    return handler(shiftCommand(args));
  }
  else {
    return handler(args.argv);
  }
};

export const shiftCommand = <
  T extends {
    command: string;
    subcommand: string;
    argv: unknown;
  },
>(args: T) => {
  const result: Record<string, unknown> = {
    argv: args.argv,
  };

  for (const key in args) {
    if (key === "command") {
      continue;
    }
    else if (/(sub)+command/.test(key)) {
      const value = args[key];
      const k = key.replace(/^sub/, "");
      result[k] = value;
    }
  }

  return result;
};

type GetCommandName<TCommand extends Command> = TCommand extends
  BasicCommand<infer TName, infer TArgv> ? TName
  : TCommand extends ComposedCommands ? never
  : TCommand extends
    CommandWithSubcommands<infer TName, infer TArgv, infer TCommands> ? TName
  : never;

export type HandlerFor<
  TCommand extends Command,
  TType extends HandlerType = "sync",
  TGlobalArgv extends {} = {},
> = TCommand extends BasicCommand<infer TName, infer TArgv>
  ? BasicHandler<TArgv & TGlobalArgv, TType>
  : TCommand extends ComposedCommands<infer TCommands, infer TArgv>
    ? ComposedHandler<
      GetCommandReturnType<ComposedCommands<TCommands, TArgv & TGlobalArgv>>,
      TType
    >
  : TCommand extends CommandWithSubcommands<
    infer TName,
    infer TArgv,
    infer TCommands,
    infer TCommandArgv
  > ? ComposedHandler<
      AddCommand<
        GetCommandReturnType<ComposedCommands<TCommands, TArgv & TCommandArgv>>,
        TName,
        TGlobalArgv
      >,
      TType
    >
  : never;

export type GetArgv<TCommand extends Command> = Parameters<
  HandlerFor<TCommand>
>[0];

export const handlerFor = <
  TCommand extends Command,
  H extends HandlerFor<TCommand>,
>(cmd: TCommand, handler: H): H => {
  return handler;
};

export const createHandlerFor = <
  TCommand extends Command,
  TInput extends InputStructHandlerFor<TCommand>,
>(
  command: TCommand,
  recordOrFunction: TInput,
): HandlerFor<TCommand, GetInputStructHandlerType<TInput>> => {
  if (command.type === "command") {
    return ((args: any) => (recordOrFunction as any)(args)) as any;
  }
  else if (command.type === "composed") {
    return createHandler(recordOrFunction as any) as any;
  }
  else {
    return createHandler({
      [command.command.commandName]: recordOrFunction as any,
    }) as any;
  }
};

type GetInputStructHandlerType<T extends InputStructHandlerFor<Command>> =
  T extends Handler ? GetHandlerType<T>
    : T extends HandlersStruct ? GetStructHandlersType<T>
    : never;

type ComposedCommandsInputStruct<TCommand extends ComposedCommands> =
  TCommand extends ComposedCommands<
    infer TCommands,
    infer TArgv
  > ? {
      [
        P in TupleKeys<TCommands> as GetCommandName<Cast<TCommands[P], Command>>
      ]: HandlerFor<
        Cast<TCommands[P], Command>,
        HandlerType,
        TArgv
      >;
    }
    : never;

export type InputStructHandlerFor<
  TCommand extends Command,
  // TType extends HandlerType = "sync",
  TGlobalArgv extends {} = {},
> = TCommand extends BasicCommand<infer TName, infer TArgv>
  ? BasicHandler<TArgv & TGlobalArgv, HandlerType>
  : TCommand extends ComposedCommands<
    infer TCommands,
    infer TArgv
  > ? ComposedCommandsInputStruct<TCommand>
  : TCommand extends CommandWithSubcommands<
    infer TName,
    infer TArgv,
    infer TCommands,
    infer TCommandArgv
  > ? ComposedHandler<
      GetCommandReturnType<ComposedCommands<TCommands, TArgv & TCommandArgv>>,
      HandlerType
    >
  : never;
