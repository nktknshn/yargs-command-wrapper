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
  isObjectWithOwnProperty,
  Last,
  ListHead,
  ToList,
  ToUnion,
  TupleKeys,
} from "./util";

/* type PathToObject<TPath extends string, TPrefix extends string = ""> =
  TPath extends `/${infer TName}/${infer TRest}` ?
      & Record<`${TPrefix}command`, TName>
      & PathToObject<`/${TRest}`, `sub${TPrefix}`>
    : {};

export type GetArgs<TArgs, TPath extends string> = TArgs extends unknown
  ? TArgs extends PathToObject<TPath> ? TArgs : never
  : never; */

export type CommandArgs = {
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
 * Gets command
 */
export type GetArgv<TCommand extends Command> = Parameters<
  HandlerFunctionFor<TCommand>
>[0];

/**
 * handler for a composed command. It receives { command; argv }
 */
export type ComposedHandler<
  TArgs extends CommandArgs,
  TType extends HandlerType = "sync",
> = TType extends "sync" ? ((args: TArgs) => void)
  : ((args: TArgs) => Promise<void>);

export type HandlerFunction = BasicHandler<any> | ComposedHandler<any>;

/**
 * Gets the type that will be returned by a handlers defined by the input `HandlersRecord`
 */
type GetHandlersRecordReturnType<T extends HandlersRecord> = {
  [K in Extract<keyof T, string>]: T[K] extends ComposedHandler<infer TArgs>
    ? PushCommand<TArgs, Cast<K, string>, {}>
    : T[K] extends BasicHandler<infer TArgv> ? { "command": K; argv: TArgv }
    : never;
}[Extract<keyof T, string>];

type TypeError<TMessage extends string> = TMessage;

export type HandlersRecord = Record<string, HandlerFunction>;

type IsHandlersRecord<T extends HandlersRecord> = T extends
  Record<string, BasicHandler<any> | ComposedHandler<any>> ? {}
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
 * @description Composes handlers into a single handler
 * @param record the handlers record. Keys are command names and values are their handler functions
 * @returns a handler that will handle the command
 */
export const composeHandlers = <TRec extends HandlersRecord>(
  record: TRec & IsHandlersRecord<TRec> & IsSameHandlersType<TRec>,
): ComposedHandler<
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

// type Length<S extends string> = ToList<_Length<S>>["length"];

// type _Length<S extends string> = S extends `${infer H}${infer T}`
//   ? H | _Length<T>
//   : never;

// type Longest<T extends string> = ToList<T> extends infer L
//   ? Length<Cast<ListHead<L>, string>> extends F ?
//   : never;

// type H = Longest<"123" | "12345" | "12" | "1234">;

// type LongestS<T extends CommandArgs> = ToList<
//   Extract<keyof T, `${string}command`>
// > extends infer L ? ListHead<L> : never;

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

// type ZZ = ShiftCommand<
//   | { command: "cmd1"; subcommand: "sub1"; argv: { a: number } }
//   | { command: "cmd1"; subcommand: "sub2"; argv: { b: number } }
// >;

// type Z = Longest<{
//   command: "a";
//   subcommand: "b";
//   subsubcommand: "b";
//   argv: {};
// }>;

// type J = Length<Z>;

export const popCommand = <
  T extends {
    command: string;
    subcommand: string;
    argv: unknown;
  },
>(args: T): PopCommand<T> => {
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
};

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
    ? BasicHandler<TArgv & TGlobalArgv, TType>
    // For ComposedCommands this is a function taking `{ command; argv }`
    : TCommand extends ComposedCommands<infer TCommands, infer TArgv>
      ? ComposedHandler<
        GetCommandReturnType<ComposedCommands<TCommands, TArgv & TGlobalArgv>>,
        TType
      >
    // this is a function taking { command: TName, subcommand; argv } for CommandWithSubcommands
    : TCommand extends CommandWithSubcommands<
      infer TName,
      infer TCommands,
      infer TArgv,
      infer TCommandArgv
    > ? ComposedHandler<
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
