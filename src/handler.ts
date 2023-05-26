import {
  BasicCommand,
  Command,
  CommandWithSubcommands,
  ComposedCommands,
  GetCommandReturnType,
  PushCommand,
} from "./types";
import {
  Cast,
  hasOwnProperty,
  isObjectWithOwnProperty,
  Last,
  ListHead,
  ToList,
  ToUnion,
  TupleKeys,
} from "./util";

export type CommandArgs<TArgv = unknown> =
  | { "command": string; "argv": TArgv }
  | NestedCommandArgs<TArgv>;

export type NestedCommandArgs<TArgv = unknown> = {
  "subcommand": string;
  "command": string;
  "argv": TArgv;
};

export type HandlerType = "sync" | "async";

/**
 * @description handler for a basic command. It's just a function that receives Argv
 */
export type BasicHandler<TArgv, TType extends HandlerType = "sync"> =
  TType extends "sync" ? ((argv: TArgv) => void)
    : ((argv: TArgv) => Promise<void>);

/**
 * @description Gets command's handler args type
 */
export type GetArgv<TCommand extends Command> = Parameters<
  HandlerFunctionFor<TCommand>
>[0]["argv"];

/**
 * @description handler for a composed command. It receives { command; argv }
 */
export type ParentHandler<
  TArgs extends CommandArgs,
  TType extends HandlerType = "sync",
> = TType extends "sync" ? ((args: TArgs) => void)
  : ((args: TArgs) => Promise<void>);

export type HandlerFunction = BasicHandler<any> | ParentHandler<any>;

/**
 * Gets the type that will be returned by a handlers defined by the input `HandlersRecord`
 */
type GetHandlersRecordReturnType<T extends HandlersRecord> = {
  [K in Extract<keyof T, string>]: T[K] extends ParentHandler<infer TArgs>
    ? PushCommand<TArgs, Cast<K, string>, {}>
    : T[K] extends BasicHandler<infer TArgv> ? { "command": K; argv: TArgv }
    : never;
}[Extract<keyof T, string>];

type TypeError<TMessage extends string> = TMessage;

export type HandlersRecord = Record<string, HandlerFunction>;

type IsHandlersRecord<T extends HandlersRecord> = T extends
  Record<string, BasicHandler<any> | ParentHandler<any>> ? {}
  : TypeError<"Invalid input object">;

type GetLastHandlersType<T extends HandlersRecord> =
  T[Cast<Last<(keyof T)>, keyof T>] extends infer A
    ? GetHandlerType<Cast<A, HandlerFunction>>
    : never;

export type GetHandlersRecordType<T extends HandlersRecord> = GetHandlerType<
  T[keyof T]
>;

export type GetHandlerType<T extends HandlerFunction> = ReturnType<T> extends
  infer A ? A extends Promise<any> ? "async"
  : "sync"
  : never;

type IsSameHandlersType<T extends HandlersRecord> =
  GetLastHandlersType<T> extends infer A
    ? GetHandlerType<T[keyof T]> extends A ? {}
    : TypeError<"Handlers must be all sync or all async">
    : never;

/**
 * @description Creates a function handler for
 * @param record the handlers record. Keys are command names and values are their handler functions
 * @returns a handler that will handle the command
 */
export const subsHandlers = <TRec extends HandlersRecord>(
  record: TRec & IsHandlersRecord<TRec> & IsSameHandlersType<TRec>,
): ParentHandler<
  GetHandlersRecordReturnType<TRec>,
  GetHandlersRecordType<TRec>
> =>
(args) => {
  const handler = record[args.command];

  if (isObjectWithOwnProperty(args, "subcommand")) {
    return handler(popCommand(args));
  }
  else {
    return handler(args.argv);
  }
};

type PopCommand<T extends CommandArgs> = ToList<T> extends infer L ? {
    [P in TupleKeys<L>]:
      & Omit<L[P], "command">
      & {
        argv: Cast<L[P], CommandArgs>["argv"];
      }
      & {
        [K in keyof L[P] as K extends `sub${infer U}` ? U : never]: L[P][K];
      };
  }[TupleKeys<L>]
  : never;

export function popCommand<
  T extends NestedCommandArgs<TArgv>,
  TArgv extends {},
>(args: T): PopCommand<T>;

export function popCommand<
  T extends { command: string; argv: TArgv },
  TArgv extends {},
>(args: T): TArgv;

export function popCommand<
  T extends CommandArgs<TArgv>,
  TArgv,
>(args: T): PopCommand<T> | TArgv {
  if (!("subcommand" in args as unknown)) {
    return args.argv;
  }

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

  return result as PopCommand<T>;
}

/**
 * Returns type of the function that will handle arguments returned after parsing by `TCommand`
 */
export type HandlerFunctionFor<
  TCommand extends Command,
  TType extends HandlerType = "sync",
  TGlobalArgv extends {} = {},
> =
  // or `BasicCommand` this is just a function takes `TArgv` and returns `void`
  TCommand extends BasicCommand<infer TName, infer TArgv>
    //
    ? BasicHandler<{ command: TName; argv: TArgv & TGlobalArgv }, TType>
    // For ComposedCommands this is a function taking `{ command; argv }`
    : TCommand extends ComposedCommands<infer TCommands, infer TArgv>
      ? ParentHandler<
        GetCommandReturnType<ComposedCommands<TCommands, TArgv & TGlobalArgv>>,
        TType
      >
    // this is a function taking { command: TName, subcommand; argv } for CommandWithSubcommands
    : TCommand extends CommandWithSubcommands<
      infer TName,
      infer TCommands,
      infer TArgv,
      infer TCommandArgv
    > ? ParentHandler<
        PushCommand<
          GetCommandReturnType<
            ComposedCommands<TCommands, TArgv & TCommandArgv>
          >,
          TName,
          TGlobalArgv
        >,
        TType
      >
    // : TCommand extends readonly Command[] ? ComposedHandler<
    //     GetCommandReturnType<ComposedCommands<TCommand, TGlobalArgv>>,
    //     TType
    //   >
    : never;

/**
 * @description Helps to type a handler function for a command
 * @param cmd Command to handle
 * @param handler Handler function
 * @returns Handler function
 */
export const handlerFor = <
  TCommand extends Command,
  H extends HandlerFunctionFor<TCommand>,
>(cmd: TCommand, handler: H): H => {
  return handler;
};
