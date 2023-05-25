import {
  BasicHandler,
  CommandArgs,
  GetHandlersStructType,
  GetHandlerType,
  HandlerFunction,
  HandlerFunctionFor,
  HandlersStruct,
  HandlerType,
  shiftCommand,
} from "./handler";
import {
  BasicCommand,
  Command,
  CommandWithSubcommands,
  ComposedCommands,
} from "./types";
import {
  Cast,
  isObjectWithOwnProperties,
  ToList,
  ToUnion,
  TupleKeys,
} from "./util";

type GetComposedCommandsNames<T extends ComposedCommands> = T extends
  ComposedCommands<infer TCommands>
  ? GetCommandName<Cast<ToUnion<TCommands>, Command>>
  : never;

/**
 * Gets the name of a command. For composed commands it returns never
 */
export type GetCommandName<TCommand extends Command> = TCommand extends
  BasicCommand<infer TName, infer TArgv> ? TName
  : TCommand extends ComposedCommands ? never
  : TCommand extends
    CommandWithSubcommands<infer TName, infer TArgv, infer TCommands> ? TName
  : never;

/**
 * Gets if the input structure sync or async
 */
export type GetInputStructHandlerType<
  T extends InputStructHandlerFor<Command>,
> =
  // if the handler is a function
  T extends HandlerFunction ? GetHandlerType<T>
    // otherwise it's a structure
    : T extends InputStructHandler ? {
        [K in keyof T]: T[K] extends HandlerFunction ? GetHandlerType<T[K]>
          : GetInputStructHandlerType<T[K]>;
      }[keyof T]
    : never;

/**
 * Flattens a composed commands tree into a list of commands that are not composed
 */
type ComposeCommandsFlatten<TCommand extends Command> = ComposedCommands<
  Cast<ToList<_ComposeCommandsFlatten<TCommand>>, readonly Command[]>,
  _ComposeCommandsFlattenArgv<TCommand>
>;

type _ComposeCommandsFlatten<TCommand extends Command> = TCommand extends
  ComposedCommands<infer TCommands, infer TArgv>
  ? ToUnion<TCommands> extends infer C
    ? C extends ComposedCommands ? _ComposeCommandsFlatten<C>
    : C
  : never
  : never;

/**
 * Gets composed commands common Argv
 */
type _ComposeCommandsFlattenArgv<TCommand extends Command> = TCommand extends
  ComposedCommands<infer TCommands, infer TArgv> ? 
    & TArgv
    & (ToUnion<TCommands> extends infer C
      ? C extends ComposedCommands ? _ComposeCommandsFlattenArgv<C>
      : {}
      : never)
  : never;

/**
 * For a composed commands the input structure is a map of the commands and their either handling functions or another input structures
 */
export type ComposedCommandsInputStruct<
  TCommand extends ComposedCommands,
  TGlobalArgv extends {},
> = ComposeCommandsFlatten<TCommand> extends ComposedCommands<
  infer TCommands,
  infer TArgv
> ? {
    [
      // key is the name of the command
      P in TupleKeys<TCommands> as GetCommandName<
        Cast<TCommands[P], Command>
      >
    ]:
      // the value is a function
      | HandlerFunctionFor<
        Cast<TCommands[P], Command>,
        HandlerType,
        TArgv & TGlobalArgv
      >
      // the value is a structure
      | InputStructHandlerFor<Cast<TCommands[P], Command>, TArgv & TGlobalArgv>;
  }
  : never;

/**
 * This defines a type of structure that can be used to create a handler for a
 * command of type `TCommand`.
 */
export type InputStructHandlerFor<
  TCommand extends Command | readonly Command[],
  // `TGlobalArgv` is object to intersect with `TArgv` of `TCommand`
  TGlobalArgv extends {} = {},
> =
  // for basic commands the handler is just a function taking the command's argv
  // TCommand extends BasicCommand<infer TName, infer TArgv>
  //   ? BasicHandler<TArgv & TGlobalArgv, HandlerType>
  //   // for composed commands,
  //   :
  TCommand extends ComposedCommands<
    infer TCommands,
    infer TArgv
  > ? ComposedCommandsInputStruct<TCommand, TGlobalArgv & TArgv>
    // for commands with subcommands the input structure is same as for the composed. Note: `TName` is not added to args
    : TCommand extends CommandWithSubcommands<
      infer TName,
      infer TArgv,
      infer TCommands,
      infer TCommandArgv
    > ? ComposedCommandsInputStruct<
        ComposedCommands<TCommands, TArgv & TCommandArgv & TGlobalArgv>,
        TGlobalArgv
      >
    : TCommand extends readonly Command[] ? ComposedCommandsInputStruct<
        ComposedCommands<TCommand, TGlobalArgv>,
        TGlobalArgv
      >
    : never;

type InputStructHandler = // | HandlerFunction
  {
    [key: string]: HandlerFunction | HandlersStruct | InputStructHandler;
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
): HandlerFunctionFor<TCommand, GetInputStructHandlerType<TInput>> => {
  return _createHandlerFor(command, recordOrFunction) as any;
};

/**
 * Traverses commands tree and returns command with given name
 */
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

export const _createHandlerFor = (
  command: Command | readonly Command[],
  recordOrFunction: InputStructHandler,
): HandlerFunction => {
  // console.log("createHandlerFor", command, recordOrFunction);

  if (isObjectWithOwnProperties(command, "type")) {
    if (command.type === "command") {
      return (args: any) => {
        const handler = recordOrFunction[command.commandName];

        if (typeof handler !== "function") {
          throw new Error(
            `Handler for command ${command.commandName} is supposed to be a function`,
          );
        }

        return handler(args.argv);
      };
    }
    else if (command.type === "composed") {
      // recordOrFunction is a record where command is key and handler is value
      return (args: CommandArgs) => {
        const cmd = args["command"];

        const namedCommand = findByName(command.commands, cmd);

        if (namedCommand === undefined) {
          throw new Error(`Command ${cmd} not found`);
        }

        const handler = recordOrFunction[cmd];

        // handler may be a function or a record of subcommands

        if (typeof handler === "function") {
          if (namedCommand.type === "command") {
            return handler(args.argv);
          }

          return handler(args);
        }
        else {
          return _createHandlerFor(namedCommand, handler)(args);
        }
      };
    }
    else {
      // CommandArgs
      return (args: any) => {
        args = shiftCommand(args);
        const cmd = args["command"];
        const handler = recordOrFunction[cmd];

        const namedCommand = findByName(command.subcommands.commands, cmd);

        if (namedCommand === undefined) {
          throw new Error(`Command ${cmd} not found`);
        }

        if (typeof handler === "function") {
          if (namedCommand.type === "command") {
            return handler(args.argv);
          }

          return handler(args);
        }
        else {
          const h = _createHandlerFor(namedCommand, handler);

          return h(args);
        }
      };
    }
  }
  else {
    console.error(`command`, command);

    throw new Error("not implemented");
  }
};
