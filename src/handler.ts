import { addCommand } from "./parser";
import {
  AddCommand,
  BasicCommand,
  Command,
  CommandWithSubcommands,
  ComposedCommands,
  GetCommandNameFromDesc,
  GetCommandReturnType,
} from "./types";
import {
  Cast,
  isObjectWithOwnProperties,
  isObjectWithOwnProperty,
  Last,
  TupleKeys,
} from "./util";

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

/**
 * Returns function that will handle arguments returned after parsing by `TCommand`
 */
export type HandlerFor<
  TCommand extends Command | readonly Command[],
  TType extends HandlerType = "sync",
  TGlobalArgv extends {} = {},
> = TCommand extends BasicCommand<infer TName, infer TArgv>
  // this is just a function taking TArgv and returning void for BasicCommand
  ? BasicHandler<TArgv & TGlobalArgv, TType>
  : TCommand extends ComposedCommands<infer TCommands, infer TArgv>
  // this is a function taking { command; argv } for ComposedCommands
    ? ComposedHandler<
      GetCommandReturnType<ComposedCommands<TCommands, TArgv & TGlobalArgv>>,
      TType
    >
  : TCommand extends CommandWithSubcommands<
    infer TName,
    infer TArgv,
    infer TCommands,
    infer TCommandArgv
  >
  // this is a function taking { command: TName, subcommand; argv } for CommandWithSubcommands
    ? ComposedHandler<
      AddCommand<
        GetCommandReturnType<ComposedCommands<TCommands, TArgv & TCommandArgv>>,
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

export type GetArgv<TCommand extends Command> = Parameters<
  HandlerFor<TCommand>
>[0];

export const handlerFor = <
  TCommand extends Command,
  H extends HandlerFor<TCommand>,
>(cmd: TCommand, handler: H): H => {
  return handler;
};

/**
 * Returns function that will handle arguments returned after parsing by `TCommand`
 */
export const createHandlerFor = <
  TCommand extends Command | readonly Command[],
  TInput extends InputStructHandlerFor<TCommand>,
>(
  command: TCommand,
  recordOrFunction: TInput,
): HandlerFor<TCommand, GetInputStructHandlerType<TInput>> => {
  return _createHandlerFor(command, recordOrFunction);
};

const findByName = (
  commands: readonly Command[],
  name: string,
): BasicCommand | CommandWithSubcommands | undefined => {
  for (const command of commands) {
    if (command.type === "command") {
      if (command.commandName === name) {
        return command;
      }
    }
    else if (command.type === "composed") {
      const found = findByName(command.commands, name);

      if (found) {
        return found;
      }
    }
    else {
      if (command.command.commandName === name) {
        return command;
      }
    }
  }

  return undefined;
};

const _createHandlerFor = (
  command: Command | readonly Command[],
  recordOrFunction: any,
): any => {
  if (isObjectWithOwnProperties(command, "type")) {
    if (command.type === "command") {
      // recordOrFunction is function
      return ((args: any) => recordOrFunction(args));
    }
    else if (command.type === "composed") {
      // recordOrFunction is a record where command is key and handler is value
      return (args: any) => {
        const cmd = args["command"];

        const namedCommand = findByName(command.commands, cmd);

        if (namedCommand === undefined) {
          throw new Error(`Command ${cmd} not found`);
        }

        const handler = recordOrFunction[cmd];

        if (namedCommand.type === "command") {
          return handler(args.argv);
        }

        return handler(args);
      };
    }
    else {
      return (args: any) => {
        args = shiftCommand(args);
        const cmd = args["command"];
        const handler = recordOrFunction[cmd];

        const namedCommand = findByName(command.subcommands.commands, cmd);

        if (namedCommand === undefined) {
          throw new Error(`Command ${cmd} not found`);
        }

        if (namedCommand.type === "command") {
          return handler(args.argv);
        }

        return handler(args);
      };
      // return createHandler({
      //   [command.command.commandName]: createHandler(
      //     recordOrFunction,
      //   ),
      // });
    }
  }
  else {
    throw new Error("Invalid command");
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
      ]: HandlerFor<Cast<TCommands[P], Command>, HandlerType, TArgv>;
    }
    : never;

export type InputStructHandlerFor<
  TCommand extends Command | readonly Command[],
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
  > ? ComposedCommandsInputStruct<
      ComposedCommands<TCommands, TArgv & TCommandArgv & TGlobalArgv>
    >
  : TCommand extends readonly Command[] ? ComposedCommandsInputStruct<
      ComposedCommands<TCommand, TGlobalArgv>
    >
  // > ? ComposedHandler<
  //     GetCommandReturnType<ComposedCommands<TCommands, TArgv & TCommandArgv>>,
  //     HandlerType
  //   >
  : never;
