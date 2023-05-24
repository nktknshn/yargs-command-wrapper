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

type F = () => void;

const a: F = () => {};
const b: F = async () => {};

type HandlerType = "sync" | "async";

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

type TypeError<TMessage extends string> = never;
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

export type HandlerFor<
  TCommand extends Command,
  TGlobalArgv extends {} = {},
> = TCommand extends BasicCommand<infer TName, infer TArgv>
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

export type GetArgv<TCommand extends Command> = Parameters<
  HandlerFor<TCommand>
>[0];

// export type InputHandlerFor<
//   TCommand extends Command,
//   TGlobalArgv extends {} = {},
// > = TCommand extends BasicCommand<infer TName, infer TArgv>
//   ? BasicHandler<TArgv & TGlobalArgv>
//   : TCommand extends ComposedCommands<
//     infer TCommands,
//     infer TArgv
//   > ? {
//       [
//         P in TupleKeys<TCommands> as GetCommandName<
//           Cast<TCommands[P], Command>
//         >
//       ]: HandlerFor<
//         Cast<TCommands[P], Command>,
//         TArgv
//       >;
//     }
//   : TCommand extends CommandWithSubcommands<
//     infer TName,
//     infer TArgv,
//     infer TCommands,
//     infer TCommandArgv
//   > ? ComposedHandler<
//       GetCommandReturnType<ComposedCommands<TCommands, TArgv & TCommandArgv>>
//     >
//   : never;

// export const createHandlerFor = <
//   TCommand extends Command,
// >(
//   command: TCommand,
//   record: InputHandlerFor<TCommand>,
// ): HandlerFor<TCommand> => {
//   return {} as any;
// };
