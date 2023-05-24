import {
  AddCommand,
  BasicCommand,
  Command,
  CommandWithSubcommands,
  ComposedCommands,
  GetCommandReturnType,
} from "./types";
import { Cast, isObjectWithOwnProperty, Last } from "./util";

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

export type GetArgv<TCommand extends Command> = Parameters<
  HandlerFor<TCommand>
>[0];

/**
 * handler for a composed command. It receives { command; argv }
 */
export type ComposedHandler<
  TArgs extends CommandArgs,
  TType extends HandlerType = "sync",
> = TType extends "sync" ? ((args: TArgs) => void)
  : ((args: TArgs) => Promise<void>);

export type Handler = BasicHandler<any> | ComposedHandler<any>;

type HandlersUnion<T extends {}> = {
  [K in Extract<keyof T, string>]: T[K] extends ComposedHandler<infer TArgs>
    ? AddCommand<TArgs, Cast<K, string>, {}>
    : T[K] extends BasicHandler<infer TArgv> ? { "command": K; argv: TArgv }
    : never;
}[Extract<keyof T, string>];

type TypeError<TMessage extends string> = TMessage;
export type HandlersStruct = Record<string, Handler>;

type IsHandlersRecord<T extends HandlersStruct> = T extends
  Record<string, BasicHandler<any> | ComposedHandler<any>> ? {}
  : TypeError<"Invalid input object">;

type GetLastHandlersType<T extends HandlersStruct> =
  T[Cast<Last<(keyof T)>, keyof T>] extends infer A
    ? GetHandlerType<Cast<A, Handler>>
    : never;

export type GetStructHandlersType<T extends HandlersStruct> = GetHandlerType<
  T[keyof T]
>;

export type GetHandlerType<T extends Handler> = ReturnType<T> extends infer A
  ? A extends Promise<any> ? "async"
  : "sync"
  : never;

type IsSameHandlersType<T extends HandlersStruct> =
  GetLastHandlersType<T> extends infer A
    ? GetHandlerType<T[keyof T]> extends A ? {}
    : TypeError<"Handlers must be all sync or all async">
    : never;

export const composeHandlers = <TRec extends HandlersStruct>(
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

/**
 * Returns function that will handle arguments returned after parsing by `TCommand`
 */
export type HandlerFor<
  TCommand extends Command | readonly Command[],
  TType extends HandlerType = "sync",
  TGlobalArgv extends {} = {},
> =
  // this is just a function taking TArgv and returning void for BasicCommand
  TCommand extends BasicCommand<infer TName, infer TArgv>
    ? BasicHandler<TArgv & TGlobalArgv, TType>
    // this is a function taking { command; argv } for ComposedCommands
    : TCommand extends ComposedCommands<infer TCommands, infer TArgv>
      ? ComposedHandler<
        GetCommandReturnType<ComposedCommands<TCommands, TArgv & TGlobalArgv>>,
        TType
      >
    // this is a function taking { command: TName, subcommand; argv } for CommandWithSubcommands
    : TCommand extends CommandWithSubcommands<
      infer TName,
      infer TArgv,
      infer TCommands,
      infer TCommandArgv
    > ? ComposedHandler<
        AddCommand<
          GetCommandReturnType<
            ComposedCommands<TCommands, TArgv & TCommandArgv>
          >,
          TName,
          TGlobalArgv
        >,
        TType
      >
    : TCommand extends readonly Command[] ? ComposedHandler<
        GetCommandReturnType<ComposedCommands<TCommand, TGlobalArgv>>,
        TType
      >
    : never;

export const handlerFor = <
  TCommand extends Command,
  H extends HandlerFor<TCommand>,
>(cmd: TCommand, handler: H): H => {
  return handler;
};
