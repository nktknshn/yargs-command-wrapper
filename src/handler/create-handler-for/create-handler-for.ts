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
import {
  CommandArgsGeneric,
  CommandName,
} from "../../command/commands/args/type-command-args-generic";
import { NestedCommandArgs } from "../../command/commands/args/type-nested-command-args";
import { showCommand } from "../../command/commands/helpers";
import { WrapperError } from "../../common/error";
import { EmptyRecord } from "../../common/types";
import { showComposableHandler } from "../handler-composable/helpers";
import { ComposableHandler } from "../handler-composable/type-composable-handler";
import { ComposableHandlerFor } from "../handler-composable/type-composable-handler-for";
import { HandlerFunction } from "../handler-function/type";
import { createHandler } from "./create-handler";
import {
  isComposableHandler,
  isFunctionHandler,
  isRecordHandler,
} from "./helpers";
import {
  ComposableHandlerForSubcommands,
  InputHandlerRecordFor,
  InputHandlerRecordType,
  SelfHandlerKey,
} from "./type-create-handler-for";
import { GetReturnType, GetSyncType } from "./type-helpers";
import { InputHandlerFunctionFor } from "./type-input-function";

import logging from "../../common/logging";

const logger = logging.getLogger("create-handler-for");

/**
 * @description Create a composable handler for a command.
 * @param command A command to create a handler for.
 * @param handler A function or a record or a composed command that defines a handler for the command.
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
    | HandlerFunction
    | InputHandlerRecordType
    | ComposableHandlerForSubcommands<Command>,
): ComposableHandler {
  logger.debug(`createHandlerFor ${showCommand(command)}.`);

  if (command.type === "command") {
    if (isFunctionHandler<CommandBasic>(functionOrRecord)) {
      return _createHandlerForCommand(command, functionOrRecord);
    }
    else {
      throw WrapperError.create(
        `Invalid handler for command ${command.commandName}. Expected function.`,
      );
    }
  }
  else if (command.type === "with-subcommands") {
    return _createHandlerForSubcommands(command, functionOrRecord);
  }
  else if (command.type === "composed") {
    if (!isComposableHandler(functionOrRecord)) {
      return _createHandlerForComposed(command, functionOrRecord);
    }
    else {
      throw WrapperError.create(
        `Invalid handler for composed command ${showCommand(command)}.`,
      );
    }
  }

  return command;
}

/**
 * @description Create a handler for a basic command.
 */
const _createHandlerForCommand = (
  command: CommandBasic,
  functionOrRecord: InputHandlerFunctionFor<CommandBasic>,
): ComposableHandler => {
  logger.debug(`_createHandlerForCommand ${showCommand(command)}.`);

  return createHandler(
    (args: CommandArgs) => {
      return functionOrRecord(args.argv);
    },
    [command.commandName],
  );
};

const _createHandlerForComposed = (
  command: CommandComposed,
  functionOrRecord:
    // either a function or a record
    | HandlerFunction
    | InputHandlerRecordType,
): ComposableHandler => {
  logger.debug(
    `_createHandlerForComposed ${showCommand(command)}.`,
    functionOrRecord,
  );

  // handler function for composed is a union of functions for each command
  if (isFunctionHandler(functionOrRecord)) {
    return createHandler(
      functionOrRecord,
      composedCommandNames(command.commands),
    );
  }
  // ComposableHandler
  else if (isRecordHandler(functionOrRecord)) {
    const handlerFunction = (
      args: CommandArgsGeneric<EmptyRecord, [CommandName]>,
    ): unknown | Promise<unknown> => {
      logger.debug(`handlerFunction for ${showCommand(command)}.`);

      const commandName = args.command ?? SelfHandlerKey;

      if (!(commandName in functionOrRecord)) {
        console.error(args, functionOrRecord);

        throw WrapperError.create(
          `No handler found for command ${String(commandName)} in record`,
        );
      }

      const handler = functionOrRecord[commandName];

      if (commandName === SelfHandlerKey) {
        if (!isFunctionHandler(handler)) {
          throw WrapperError.create(
            `Invalid handler for command ${
              showCommand(command)
            } itself. Expected function.`,
          );
        }
        return handler(args.argv);
      }

      const commandToHandle = findByNameInComposed(
        command.commands,
        commandName,
      );

      if (commandToHandle === undefined) {
        throw WrapperError.create(
          `No command ${String(commandName)} among composed.`,
        );
      }

      return composedHandlerFunction(args, commandToHandle, handler);
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
    | InputHandlerFunctionFor<CommandBasic>
    | InputHandlerRecordType
    | ComposableHandler<CommandArgs>,
): ComposableHandler<any> => {
  logger.debug(`_createHandlerForSubcommands ${showCommand(command)}.`);

  // XXX remove `any`
  // InputHandlerFunctionFor
  if (isFunctionHandler(functionOrRecord)) {
    return createHandler(
      (a: NestedCommandArgs) => functionOrRecord(popCommand(a)),
      [command.command.commandName],
    );
  }
  // ComposableHandler
  else if (
    isComposableHandler(functionOrRecord)
  ) {
    const _handlerFunction = (
      args: NestedCommandArgs,
    ): unknown | Promise<unknown> => {
      const _args = popCommand(args);
      return functionOrRecord.handle(_args);
    };

    return createHandler(_handlerFunction, [command.command.commandName]);
  }
  // InputRecordHandler
  else if (isRecordHandler<CommandComposedWithSubcommands>(functionOrRecord)) {
    const _handlerFunction = (
      args: NestedCommandArgs,
    ): unknown | Promise<unknown> => {
      logger.info(`handlerFunction for ${showCommand(command)}.`);

      const commandName = args.command;

      if (command.command.commandName !== commandName) {
        console.error(args, command);
        throw WrapperError.create(`Unmatched command name ${commandName}`);
      }

      const _args = popCommand(args);
      const _commandName = _args.command ?? SelfHandlerKey;

      if (!(_commandName in functionOrRecord)) {
        console.error(_args, functionOrRecord);

        throw WrapperError.create(
          `No handler found for command ${commandName}`,
        );
      }

      const handler = functionOrRecord[_commandName];

      let commandToHandle;
      if (_commandName !== SelfHandlerKey) {
        commandToHandle = findByNameInComposed(
          command.subcommands.commands,
          _commandName,
        );
      }
      else {
        commandToHandle = command.command;
      }
      // find the command from `args.subcommand`

      if (commandToHandle === undefined) {
        throw WrapperError.create(
          `No command ${commandName} among subcommands`,
        );
      }

      return composedHandlerFunction(_args, commandToHandle, handler);
    };

    return createHandler(_handlerFunction, [
      command.command.commandName,
    ]);
  }

  return functionOrRecord;
};

/**
 * @description handle args by a handler for a named command
 */
const composedHandlerFunction = (
  args: CommandArgs,
  commandToHandle: CommandBasic | CommandComposedWithSubcommands,
  handler:
    | HandlerFunction<EmptyRecord>
    | ComposableHandler<CommandArgs>
    | InputHandlerRecordType<EmptyRecord>,
) => {
  const commandName = args.command;

  if (commandToHandle.type === "command") {
    // the command is a basic command
    if (isFunctionHandler(handler)) {
      // and the handler is a function for args.argv
      return handler(args.argv);
    }
    else if (isComposableHandler(handler)) {
      // and the handler is a composable handler
      if (handler.supports.includes(commandName)) {
        return handler.handle(args);
      }
      else {
        // somehow the handler does not support the command (shouldn't happen if the typing works properly)
        throw WrapperError.create(
          `Invalid handler for ${commandToHandle.commandName}: ${
            showComposableHandler(handler)
          }`,
        );
      }
    }
    else {
      // handler for a basic command is a record (shouldn't happen if the typing works properly)
      throw WrapperError.create(
        `Invalid handler for command ${commandName}. Expected function or composable handler.`,
      );
    }
  }
  else {
    // the command is a command with subcommands
    if (isFunctionHandler(handler)) {
      // the handler function is a handler for the union of subcommands
      // we remove command from args
      return handler(popCommand(args));
    }
    else if (isComposableHandler(handler)) {
      // the composed handler is a handler for the command with subcommands
      if (handler.supports.includes(args.command)) {
        return handler.handle(args);
      }

      // the composed handler is a handler for the subcommands
      return _createHandlerForSubcommands(commandToHandle, handler).handle(
        args,
      );
    }
    else {
      // the record defines the handler for the subcommands
      return _createHandlerForSubcommands(commandToHandle, handler).handle(
        args,
      );
    }
  }
};
