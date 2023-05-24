import {
  AddCommand,
  BasicCommand,
  Command,
  CommandWithSubcommands,
  ComposedCommands,
  GetCommandNameFromDesc,
  GetCommandReturnType,
} from "./types";
import { Cast, isObjectWithOwnProperty, TupleKeys } from "./util";

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

/**
 * handler for a basic command. It's just a function that receives Argv
 */
export type BasicHandler<TArgv> = (argv: TArgv) => void;

/**
 * handler for a composed command. It receives { command; argv }
 */
export type ComposedHandler<TArgs extends CommandArgs> = (args: TArgs) => void;

export type HandlerSync<TArgv extends Record<string, unknown>> = (
  args: TArgv,
) => void;

export type HandlerAsync<TArgv extends Record<string, unknown>> = (
  args: TArgv,
) => Promise<void>;

// type HandlersRecord = Record<string, Handler<never>>;

type HandlersUnion<T extends {}> = {
  [K in Extract<keyof T, string>]: T[K] extends ComposedHandler<infer TArgs>
    ? AddCommand<TArgs, Cast<K, string>, {}>
    : T[K] extends BasicHandler<infer TArgv> ? { "command": K; argv: TArgv }
    : never;
}[Extract<keyof T, string>];

type IsHandlersRecord<T> = T extends
  Record<string, BasicHandler<any> | ComposedHandler<any>> ? {}
  : never;

export const createHandler = <TRec extends Record<string, any>>(
  record: TRec & IsHandlersRecord<TRec>,
): ComposedHandler<HandlersUnion<TRec>> =>
(args) => {
  const handler = record[args.command];

  if (isObjectWithOwnProperty(args, "subcommand")) {
    return handler(shiftCommand(args));
  }
  else {
    return handler(args.argv);
  }
};

// let a: unknown = 1;
// let b: number = 0 as unknown;

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

export type InputHandlerFor<
  TCommand extends Command,
  TGlobalArgv extends {} = {},
> = TCommand extends BasicCommand<infer TName, infer TArgv>
  ? BasicHandler<TArgv & TGlobalArgv>
  : TCommand extends ComposedCommands<
    infer TCommands,
    infer TArgv
  > ? {
      [
        P in TupleKeys<TCommands> as GetCommandName<
          Cast<TCommands[P], Command>
        >
      ]: HandlerFor<
        Cast<TCommands[P], Command>,
        TArgv
      >;
    }
  : TCommand extends CommandWithSubcommands<
    infer TName,
    infer TArgv,
    infer TCommands,
    infer TCommandArgv
  > ? ComposedHandler<
      GetCommandReturnType<ComposedCommands<TCommands, TArgv & TCommandArgv>>
    >
  : never;

export type HandlerFor<TCommand extends Command, TGlobalArgv extends {} = {}> =
  TCommand extends BasicCommand<infer TName, infer TArgv>
    ? BasicHandler<TArgv & TGlobalArgv>
    : TCommand extends ComposedCommands<
      infer TCommands,
      infer TArgv
    > ? ComposedHandler<
        GetCommandReturnType<ComposedCommands<TCommands, TArgv & TGlobalArgv>>
      >
    : TCommand extends CommandWithSubcommands<
      infer TName,
      infer TArgv,
      infer TCommands,
      infer TCommandArgv
    > ? ComposedHandler<
        GetCommandReturnType<ComposedCommands<TCommands, TArgv & TCommandArgv>>
      >
    : never;

export const createHandlerFor = <
  TCommand extends Command,
>(
  command: TCommand,
  record: InputHandlerFor<TCommand>,
): HandlerFor<TCommand> => {
  return {} as any;
};
