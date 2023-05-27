import { findByNameInComposed } from "./helpers";
import {
  ComposableHandler,
  ComposableHandlerFor,
  InputHandlerFunctionFor,
  InputRecordHandler,
  InputRecordHandlerFor,
} from "./types";

import {
  CommandArgs,
  HandlerFunction,
  NestedCommandArgs,
  popCommand,
} from "./handler";

import {
  BasicCommand,
  Command,
  CommandWithSubcommands,
  ComposedCommands,
} from "../types";
import { isObjectWithOwnProperty } from "../util";
import { composedCommandNames } from "./helpers";

export function createHandlerFor<
  TCommand extends BasicCommand,
>(
  command: TCommand,
  handler: InputHandlerFunctionFor<TCommand>,
): ComposableHandlerFor<TCommand>;

export function createHandlerFor<
  TCommand extends ComposedCommands,
>(
  command: TCommand,
  handler: InputHandlerFunctionFor<TCommand> | InputRecordHandlerFor<TCommand>,
): ComposableHandlerFor<TCommand>;

export function createHandlerFor<
  TCommand extends CommandWithSubcommands,
>(
  command: TCommand,
  handler: InputHandlerFunctionFor<TCommand> | InputRecordHandlerFor<TCommand>,
): ComposableHandlerFor<TCommand>;

export function createHandlerFor<
  TCommand extends Command,
>(
  command: TCommand,
  functionOrRecord:
    // either a function or a record
    | InputHandlerFunctionFor<TCommand>
    | InputRecordHandler,
): ComposableHandler {
  if (typeof functionOrRecord === "function") {
    if (command.type === "command") {
      return _createHandler((args: any) => {
        return functionOrRecord(args.argv);
      }, [command.commandName]);
    }
    else if (command.type === "composed") {
      return _createHandler(functionOrRecord, composedCommandNames(command));
    }
    else {
      return _createHandler(functionOrRecord, [command.command.commandName]);
    }
  }
  else {
    if (command.type === "composed") {
      //
      const handlerFunction = (args: CommandArgs): void => {
        const commandName = args.command;
        if (!(args.command in functionOrRecord)) {
          throw new Error(`No handler found for command ${commandName}`);
        }

        const handler = functionOrRecord[commandName];

        const namedCommand = findByNameInComposed(
          command.commands,
          commandName,
        );

        if (namedCommand === undefined) {
          throw new Error(`No command ${commandName} among composed`);
        }

        if (typeof handler === "function") {
          if (namedCommand.type === "command") {
            return handler(args.argv);
          }
          return handler(args);
        }
        else if (isComposableHandler(handler)) {
          if (namedCommand.type === "command") {
            return handler.handle(args);
          }
          else {
            return handler.handle(args);
          }
        }
        else {
          if (namedCommand.type === "with-subcommands") {
            return createHandlerFor(namedCommand, handler).handle(args);
          }
          else {
            throw new Error(`No handler found for command ${commandName}`);
          }
        }
      };

      return _createHandler(handlerFunction, composedCommandNames(command));
    }
    else if (command.type === "with-subcommands") {
      const handlerFunction = (args: NestedCommandArgs<{}>): void => {
        const commandName = args.command;

        if (command.command.commandName !== commandName) {
          console.error(args, command);
          throw new Error(`Unmatched command name ${commandName}`);
        }

        const _args = popCommand(args);

        if (!(_args.command in functionOrRecord)) {
          throw new Error(`No handler found for command ${commandName}`);
        }

        const handler = functionOrRecord[_args.command];

        const namedCommand = findByNameInComposed(
          command.subcommands.commands,
          _args.command,
        );

        if (namedCommand === undefined) {
          throw new Error(`No command ${commandName} among subcommands`);
        }

        if (typeof handler === "function") {
          return handler(_args.argv);
        }
        else if (isComposableHandler(handler)) {
          return handler.handle(_args);
        }
        else {
          if (namedCommand.type === "with-subcommands") {
            return createHandlerFor(namedCommand, handler).handle(_args);
          }
          else {
            throw new Error(`Invalid handler for ${namedCommand.type}`);
          }
        }
      };

      return _createHandler(handlerFunction, [command.command.commandName]);
    }
    else {
      throw new Error(`Invalid handler for ${command.commandName}`);
    }
  }
}

export const _createHandler = (
  handler: InputHandlerFunctionFor<Command>,
  supports: string[],
): ComposableHandler => {
  const _handler = (args: any): void => {
    handler(args);
  };
  // _handler.supports = supports;

  return {
    handle: _handler,
    supports,
  };
};

const isComposableHandler = (
  handler: HandlerFunction | InputRecordHandler | ComposableHandler,
): handler is ComposableHandler => {
  return isObjectWithOwnProperty(handler, "handle");
};
