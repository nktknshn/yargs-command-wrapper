import {
  BasicHandler,
  GetHandlerType,
  GetStructHandlersType,
  Handler,
  HandlerFor,
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

export type GetCommandName<TCommand extends Command> = TCommand extends
  BasicCommand<infer TName, infer TArgv> ? TName
  : TCommand extends ComposedCommands ? never
  : TCommand extends
    CommandWithSubcommands<infer TName, infer TArgv, infer TCommands> ? TName
  : never;
export type GetInputStructHandlerType<
  T extends InputStructHandlerFor<Command>,
> = T extends Handler ? GetHandlerType<T>
  : T extends HandlersStruct ? GetStructHandlersType<T>
  : never;
type ComposeCommandsFlatten<TCommand extends Command> = ComposedCommands<
  Cast<ToList<_ComposeCommandsFlatten<TCommand>>, readonly Command[]>
>;
type _ComposeCommandsFlatten<TCommand extends Command> = TCommand extends
  ComposedCommands<infer TCommands, infer TArgv>
  ? ToUnion<TCommands> extends infer C
    ? C extends ComposedCommands ? _ComposeCommandsFlatten<C> : C
  : never
  : never;

export type ComposedCommandsInputStruct<TCommand extends ComposedCommands> =
  ComposeCommandsFlatten<TCommand> extends ComposedCommands<
    infer TCommands,
    infer TArgv
  > ? {
      [
        P in TupleKeys<TCommands> as GetCommandName<
          Cast<TCommands[P], Command>
        >
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
  : never;
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
export const _createHandlerFor = (
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
