import {
  BasicCommand,
  Command,
  CommandWithSubcommands,
  ComposedCommands,
} from "../../command";

import {
  composedCommandNames,
  findByNameInComposed,
} from "../../command/commands/composed/helpers";
import { isObjectWithOwnProperty } from "../../common/util";
import { popCommand } from "../helpers";

import { ComposableHandler, ComposableHandlerFor } from "../types-compose";
import {
  CommandArgs,
  HandlerSyncType,
  NestedCommandArgs,
} from "../types-handler";
import {
  GetReturnType,
  GetSyncType,
  InputHandlerForSubcommands,
  InputHandlerFunctionFor,
  InputHandlerRecordFor,
  InputRecordHandler,
} from "./types-handler-for";

export function createHandlerFor<
  TCommand extends BasicCommand,
  H extends InputHandlerFunctionFor<TCommand>,
>(
  command: TCommand,
  handler: H,
): ComposableHandlerFor<TCommand, GetSyncType<H>, {}, GetReturnType<H>>;

export function createHandlerFor<
  TCommand extends ComposedCommands,
  H extends
    | InputHandlerFunctionFor<TCommand>
    | InputHandlerRecordFor<TCommand>,
>(
  command: TCommand,
  handler: H,
): ComposableHandlerFor<TCommand, GetSyncType<H>, {}, GetReturnType<H>>;

export function createHandlerFor<
  TCommand extends CommandWithSubcommands,
  H extends
    | InputHandlerFunctionFor<TCommand>
    | InputHandlerForSubcommands<TCommand>
    | InputHandlerRecordFor<TCommand>,
>(
  command: TCommand,
  handler: H,
): ComposableHandlerFor<TCommand, GetSyncType<H>, {}, GetReturnType<H>>;

export function createHandlerFor<
  TCommand extends Command,
>(
  command: TCommand,
  functionOrRecord:
    | InputHandlerFunctionFor<TCommand>
    | ComposableHandler
    | InputHandlerRecordFor<TCommand>,
): ComposableHandler {
  if (command.type === "command") {
    if (isFunctionHandler(functionOrRecord)) {
      return _createHandlerForCommand(command, functionOrRecord as any);
    }
    else {
      throw new Error("BasicCommand handler must be a function");
    }
  }
  else if (command.type === "with-subcommands") {
    return _createHandlerForSubcommands(command, functionOrRecord);
  }
  else if (command.type === "composed") {
    return _createHandlerForComposed(command, functionOrRecord);
  }

  return command;
}

/**
 * @description Create a handler for a basic command.
 */
const _createHandlerForCommand = (
  command: BasicCommand,
  functionOrRecord: InputHandlerFunctionFor<BasicCommand>,
): ComposableHandler => {
  return _createHandler((args: any) => {
    return functionOrRecord(args.argv);
  }, [command.commandName]);
};

const _createHandlerForComposed = (
  command: ComposedCommands,
  functionOrRecord:
    // either a function or a record
    | InputHandlerFunctionFor<ComposedCommands>
    | InputRecordHandler
    | ComposableHandler,
): ComposableHandler => {
  if (isFunctionHandler(functionOrRecord)) {
    return _createHandler(
      functionOrRecord,
      composedCommandNames(command.commands),
    );
  }
  // ComposableHandler
  else if (isComposableHandler(functionOrRecord)) {
    const handlerFunction = (argv: CommandArgs): void => {
      functionOrRecord.handle(argv);
    };
    return _createHandler(
      handlerFunction,
      composedCommandNames(command.commands),
    );
  }
  else if (isRecordHandler(functionOrRecord)) {
    const handlerFunction = (args: CommandArgs): void | Promise<void> => {
      const commandName = args.command;

      if (!(args.command in functionOrRecord)) {
        throw new Error(`No handler found for command ${commandName}`);
      }

      const handler = functionOrRecord[commandName];

      const commandToHandle = findByNameInComposed(
        command.commands,
        commandName,
      );

      if (commandToHandle === undefined) {
        throw new Error(`No command ${commandName} among composed.`);
      }

      if (typeof handler === "function") {
        if (commandToHandle.type === "command") {
          return handler(args.argv);
        }
        return handler(args);
      }
      else if (isComposableHandler(handler)) {
        return handler.handle(args);
      }
      // handler is a record
      else {
        if (commandToHandle.type === "with-subcommands") {
          return createHandlerFor(commandToHandle, handler).handle(args);
        }
        else {
          throw new Error(
            `Invalid pair of command and handler: handler is record, command is ${commandToHandle.type}`,
          );
        }
      }
    };

    return _createHandler(
      handlerFunction,
      composedCommandNames(command.commands),
    );
  }

  return functionOrRecord;
};

const _createHandlerForSubcommands = (
  command: CommandWithSubcommands,
  functionOrRecord:
    // either a function or a record
    | InputHandlerFunctionFor<CommandWithSubcommands>
    | InputRecordHandler
    | ComposableHandler,
): ComposableHandler => {
  // InputHandlerFunctionFor
  if (isFunctionHandler(functionOrRecord)) {
    return _createHandler(functionOrRecord, [command.command.commandName]);
  }
  // ComposableHandler
  else if (isComposableHandler(functionOrRecord)) {
    const _handlerFunction = (
      args: NestedCommandArgs<{}>,
    ): void | Promise<void> => {
      return functionOrRecord.handle(popCommand(args));
    };

    return _createHandler<CommandWithSubcommands>(_handlerFunction, [
      command.command.commandName,
    ]);
  }
  // InputRecordHandler
  else if (isRecordHandler(functionOrRecord)) {
    const _handlerFunction = (
      args: NestedCommandArgs<{}>,
    ): void | Promise<void> => {
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

    return _createHandler<CommandWithSubcommands>(_handlerFunction, [
      command.command.commandName,
    ]);
  }

  return functionOrRecord;
};

type CreateHandlerForFunc<TCommand extends Command> = TCommand extends
  BasicCommand ? ((args: {}) => void)
  : TCommand extends ComposedCommands ? ((args: CommandArgs) => void)
  : TCommand extends CommandWithSubcommands
    ? ((args: NestedCommandArgs<{}>) => void)
  : never;

export const _createHandler = <TCommand extends Command>(
  handler: CreateHandlerForFunc<TCommand>,
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

const isFunctionHandler = (
  handler:
    | InputHandlerFunctionFor<Command>
    | InputRecordHandler
    | ComposableHandler,
): handler is InputHandlerFunctionFor<Command> => {
  return typeof handler === "function";
};

const isRecordHandler = (
  handler:
    | InputHandlerFunctionFor<Command>
    | InputRecordHandler
    | ComposableHandler,
): handler is InputRecordHandler => {
  return typeof handler === "object";
};

const isComposableHandler = (
  handler:
    | InputHandlerFunctionFor<Command>
    | InputRecordHandler
    | ComposableHandler,
): handler is ComposableHandler => {
  return isObjectWithOwnProperty(handler, "handle");
};
