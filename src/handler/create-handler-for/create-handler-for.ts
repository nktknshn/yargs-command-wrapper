import {
  Command,
  CommandBasic,
  CommandComposed,
  CommandComposedWithSubcommands,
} from "../../command";

import { popCommand } from "../../command/commands/args/pop-command";
import {
  composedCommandNames,
  findByNameInComposed,
} from "../../command/commands/composed/helpers";

import { CommandArgs } from "../../command/commands/args/type-command-args";
import { NestedCommandArgs } from "../../command/commands/args/type-nested-command-args";
import { EmptyRecord } from "../../common/types";
import { ComposableHandlerFor } from "../handler-composable/composable-handler-for";
import { showComposableHandler } from "../handler-composable/helpers";
import { ComposableHandler } from "../handler-composable/type";
import { createHandler } from "./create-handler";
import {
  isComposableHandler,
  isFunctionHandler,
  isRecordHandler,
} from "./helpers";
import {
  ComposableHandlerForSubcommands,
  InputHandlerRecordFor,
  InputRecordHandler,
} from "./type-create-handler-for";
import { GetReturnType, GetSyncType } from "./type-helpers";
import { InputHandlerFunctionFor } from "./type-input-function";

/**
 * @description Create a composable handler for a command.
 * @param command A command to create a handler for.
 * @param functionOrRecord A function or a record that defines a handler for the command.
 * @returns A composable handler for the command.
 */
export function createHandlerFor<
  TCommand extends CommandBasic,
  H extends InputHandlerFunctionFor<TCommand>,
>(
  command: TCommand,
  handler: H,
): ComposableHandlerFor<TCommand, GetSyncType<H>, GetReturnType<H>>;

export function createHandlerFor<
  TCommand extends CommandComposed,
  H extends
    | InputHandlerFunctionFor<TCommand>
    | InputHandlerRecordFor<TCommand>,
>(
  command: TCommand,
  handler: H,
): ComposableHandlerFor<TCommand, GetSyncType<H>, GetReturnType<H>>;

export function createHandlerFor<
  TCommand extends CommandComposedWithSubcommands,
  H extends
    | InputHandlerFunctionFor<TCommand>
    | InputHandlerRecordFor<TCommand>
    | ComposableHandlerForSubcommands<TCommand>,
>(
  command: TCommand,
  handler: H,
): ComposableHandlerFor<TCommand, GetSyncType<H>, GetReturnType<H>>;

export function createHandlerFor(
  command: Command,
  functionOrRecord:
    | InputHandlerFunctionFor<Command>
    | InputHandlerRecordFor<Command>
    | ComposableHandlerForSubcommands<Command>,
): ComposableHandler {
  if (command.type === "command") {
    if (isFunctionHandler(functionOrRecord)) {
      return _createHandlerForCommand(
        command,
        functionOrRecord,
      );
    }
    else {
      throw new Error(
        `Invalid handler for command ${command.commandName}. Expected function.`,
      );
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
const _createHandlerForCommand = <
  TCommand extends CommandBasic,
>(
  command: CommandBasic,
  functionOrRecord: InputHandlerFunctionFor<TCommand>,
): ComposableHandlerFor<TCommand> => {
  return createHandler(
    (args) => {
      return functionOrRecord(args.argv);
    },
    [command.commandName],
  );
};

const _createHandlerForComposed = <TCommand extends CommandComposed>(
  command: TCommand,
  functionOrRecord:
    // either a function or a record
    | InputHandlerFunctionFor<CommandComposed>
    | InputRecordHandler
    | ComposableHandler,
): ComposableHandler => {
  if (isFunctionHandler(functionOrRecord)) {
    return createHandler(
      functionOrRecord,
      composedCommandNames(command.commands),
    );
  }
  // ComposableHandler
  else if (isComposableHandler<TCommand>(functionOrRecord)) {
    const handlerFunction = (args: CommandArgs): unknown | Promise<unknown> => {
      return functionOrRecord.handle(args);
    };
    return createHandler(
      handlerFunction,
      composedCommandNames(command.commands),
    );
  }
  else if (isRecordHandler(functionOrRecord)) {
    const handlerFunction = (args: CommandArgs): unknown | Promise<unknown> => {
      const commandName = args.command;

      if (!(args.command in functionOrRecord)) {
        console.error(
          args,
          functionOrRecord,
        );

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
        // case when the handler is for the command
        if (handler.supports.includes(args.command)) {
          return handler.handle(args);
        }
        // case when the handler is for the subcommands of the command
        else if (commandToHandle.type === "with-subcommands") {
          return createHandlerFor(commandToHandle, handler).handle(args);
        }
        else {
          throw new Error(
            `Invalid handler for ${commandToHandle.type}: ${
              showComposableHandler(handler)
            }`,
          );
        }
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

    return createHandler(
      handlerFunction,
      composedCommandNames(command.commands),
    );
  }

  return functionOrRecord;
};

const _createHandlerForSubcommands = (
  command: CommandComposedWithSubcommands,
  functionOrRecord:
    // either a function or a record
    | InputHandlerFunctionFor<CommandComposedWithSubcommands>
    | InputRecordHandler
    | ComposableHandler,
): ComposableHandler => {
  // InputHandlerFunctionFor
  if (isFunctionHandler(functionOrRecord)) {
    return createHandler(functionOrRecord, [command.command.commandName]);
  }
  // ComposableHandler
  else if (isComposableHandler(functionOrRecord)) {
    const _handlerFunction = (
      args: NestedCommandArgs<EmptyRecord, string, string>,
    ): unknown | Promise<unknown> => {
      const _args = popCommand(args);
      return functionOrRecord.handle(_args);
    };

    return createHandler<
      CommandComposedWithSubcommands,
      typeof _handlerFunction
    >(_handlerFunction, [command.command.commandName]);
  }
  // InputRecordHandler
  else if (isRecordHandler(functionOrRecord)) {
    const _handlerFunction = (
      args: NestedCommandArgs<EmptyRecord, string, string>,
    ): unknown | Promise<unknown> => {
      const commandName = args.command;

      if (command.command.commandName !== commandName) {
        console.error(args, command);
        throw new Error(`Unmatched command name ${commandName}`);
      }

      const _args = popCommand(args);

      if (!(_args.command in functionOrRecord)) {
        console.error(
          _args,
          functionOrRecord,
        );

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
        if (handler.supports.includes(_args.command)) {
          return handler.handle(_args);
        }
        else if (namedCommand.type === "with-subcommands") {
          // this is the case when the handler is
          return createHandlerFor(namedCommand, handler).handle(_args);
        }
        else {
          throw new Error(
            `Invalid handler for ${namedCommand.type}: ${
              showComposableHandler(handler)
            }`,
          );
        }
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

    return createHandler(_handlerFunction, [
      command.command.commandName,
    ]);
  }

  return functionOrRecord;
};
