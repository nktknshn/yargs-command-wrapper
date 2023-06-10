import y from "yargs";
import { appendSubcommand } from "../command/commands/args/push-command";
import { Command } from "../command/commands/command";
import {
  showCommand,
  showCommands,
  showCommandsNames,
} from "../command/commands/helpers";
import { GetCommandArgs } from "../command/commands/type-parse-result";
import { YargsCommandBuilder } from "../command/types";
import * as E from "../common/either";
import { ErrorType } from "../common/error";
import { EmptyRecord } from "../common/types";
import { build } from "./build-yargs";
import { findAlias } from "./helpers";

import log from "../common/logging";

const logger = log.getLogger("parser");

type BuildAndParseResult<TCommand extends Command> = {
  result: E.Either<ErrorType, GetCommandArgs<TCommand>>;
  yargs: y.Argv;
};

/**
 * @description build yargs object and parse arguments
 * @param command command object
 * @param arg arguments to parse. if not provided, process.argv.slice(2) is used
 * @returns yargs object and parse result
 */
export const buildAndParse = <TCommand extends Command>(
  command: TCommand,
  arg?: string | readonly string[],
  builder?: YargsCommandBuilder<EmptyRecord>,
): BuildAndParseResult<TCommand> => {
  const yargsObject = build(command);

  return {
    result: parse(
      command,
      builder ? builder(yargsObject) : yargsObject,
      arg,
    ),
    yargs: yargsObject,
  };
};

/**
 * @description Build yargs object and parse arguments. Throw error if failed
 * @param
 * @returns
 */
export const buildAndParseUnsafe = <TCommand extends Command>(
  command: TCommand,
  arg?: string | readonly string[],
): { result: GetCommandArgs<TCommand>; yargs: y.Argv } => {
  const { result, yargs } = buildAndParse(command, arg);

  if (E.isLeft(result)) {
    throw new Error(result.left.message);
  }
  return { result: result.right, yargs };
};

export const buildAndParseUnsafeR = <TCommand extends Command>(
  command: TCommand,
  arg?: string | readonly string[],
): GetCommandArgs<TCommand> => {
  const { result } = buildAndParse(command, arg);

  if (E.isLeft(result)) {
    throw new Error(result.left.message);
  }
  return result.right;
};

/**
 * @description parse arguments with yargs object built from command
 * @param
 * @returns
 */
// export const parse2 = <TCommand extends Command>(
//   command: TCommand,
//   yargsObject: y.Argv,
//   arg?: string | readonly string[],
//   stripArgv = true,
// ): E.Either<ErrorType, GetCommandArgs<TCommand>> => {
// try {
//   const argv = arg !== undefined
//     ? yargsObject.parseSync(arg)
//     : yargsObject.parseSync(process.argv.slice(2));

//   let result: Record<string, unknown> = {};

//   let currentCommand: Command | undefined = command;

//   const parsedCommands = argv._;

//   for (let cmd of parsedCommands.map(String)) {
//     if (currentCommand === undefined) {
//       return E.left({
//         error: "command not found",
//         message: "out of commands",
//       });
//     }

//     const alias =  findAlias(
//         currentCommand,
//         cmd,
//       );

//     if (E.isLeft(alias)) {
//       return alias;
//     }
//     const {currentCommand, fullName, nextCommands, type} = alias.right;

//     result = appendSubcommand(result, cmd);
//     // const prefix = replicate(idx, `sub`).join("");

//     // result[`${prefix}command`] = cmd;
//   }

//   const _argv: Partial<typeof argv> = { ...argv };
//   if (stripArgv) {
//     delete _argv["_"];
//     delete _argv["$0"];
//   }
//   result["argv"] = _argv;

//   return E.of(result as GetCommandArgs<TCommand>);
// } catch (e) {
//   return E.left({ error: "yargs error", message: String(e) });
// }
// };

/**
 * @description parse arguments with yargs object built from command
 * @param
 * @returns
 */
export const parse = <TCommand extends Command>(
  command: TCommand,
  yargsObject: y.Argv,
  arg?: string | readonly string[],
  stripArgv = true,
): E.Either<ErrorType, GetCommandArgs<TCommand>> => {
  logger.debug(`parse command: ${showCommand(command, true)}`);

  try {
    const argv = arg !== undefined
      ? yargsObject.parseSync(arg)
      : yargsObject.parseSync(process.argv.slice(2));

    const parsedCommands = argv._.map(String);

    const _argv: Partial<typeof argv> = { ...argv };
    if (stripArgv) {
      delete _argv["_"];
      delete _argv["$0"];
    }

    return _parse(command, parsedCommands, { argv: _argv }) as E.Either<
      ErrorType,
      GetCommandArgs<TCommand>
    >;
    // return E.of(result as GetCommandArgs<TCommand>);
  } catch (e) {
    return E.left({ error: "yargs error", message: String(e) });
  }
};

const _parse = (
  command: Command,
  parsedCommands: readonly string[],
  context: Record<string, unknown>,
): E.Either<ErrorType, Record<string, unknown>> => {
  logger.debug(
    `_parse command: ${showCommand(command, true)}`,
    { parsedCommands, context },
  );

  if (command.type === "command") {
    if (
      parsedCommands.length != 1 || parsedCommands[0] != command.commandName
    ) {
      return E.left({
        error: "command not found",
        message: `expected '${command.commandName}' received: '${
          parsedCommands.join(" ")
        }'`,
      });
    }

    return E.right(appendSubcommand(context, command.commandName));
  }
  else if (command.type === "composed") {
    if (parsedCommands.length === 0) {
      if (command.props.selfHandle) {
        return E.right(appendSubcommand(context, ""));
      }
      else {
        return E.left({
          error: "command not found",
          message: `Processing ${showCommand(command)}. Expected ${
            showCommands(command.commands)
          }. received: nothing`,
        });
      }
    }

    const aliasEither = findAlias(command, parsedCommands[0]);

    if (E.isLeft(aliasEither)) {
      return aliasEither;
    }

    const {
      type,
      fullName,
      nextCommands,
      currentCommand,
    } = aliasEither.right;

    logger.debug(
      `Alias found: ${showCommand(currentCommand)} -> ${
        nextCommands ? showCommand(nextCommands) : "no next subcommands"
      }`,
    );

    const restCommandArgs: readonly string[] = parsedCommands.slice(1);

    if (type === "command") {
      if (restCommandArgs.length == 0) {
        return E.right(appendSubcommand(context, fullName));
      }
      else {
        return E.left({
          error: "command not found",
          message: `Unexpected commands: ${restCommandArgs.join(" ")}`,
        });
      }
    }
    else {
      if (restCommandArgs.length == 0) {
        // valid if the command is self handle
        if (currentCommand.props.selfHandle) {
          return E.right(appendSubcommand(context, fullName));
        }
        // or the composed is self handled
        else if (
          nextCommands.props.selfHandle
        ) {
          return E.right(
            appendSubcommand(appendSubcommand(context, fullName), ""),
          );
        }
        else {
          return E.left({
            error: "command not found",
            message: `processing ${showCommand(command, true)}. expected ${
              showCommandsNames([nextCommands])
            }. received: nothing`,
          });
        }
      }
      else {
        return _parse(
          nextCommands,
          restCommandArgs,
          appendSubcommand(context, fullName),
        );
      }
    }
  }
  else {
    if (parsedCommands.length == 0) {
      return E.left({
        error: "command not found",
        message: `expected ${
          showCommands(command.subcommands.commands)
        }. received: nothing`,
      });
    }

    if (parsedCommands[0] !== command.command.commandName) {
      return E.left({
        error: "command not found",
        message: `expected [${command.command.commandName}] received: ${
          parsedCommands.join(",")
        }`,
      });
    }

    const rest = parsedCommands.slice(1);
    context = appendSubcommand(context, command.command.commandName);

    if (rest.length == 0 && !command.subcommands.props.selfHandle) {
      if (command.props.selfHandle) {
        return E.right(context);
      }
      else {
        return E.left({
          error: "command not found",
          message: `expected ${
            showCommands(command.subcommands.commands)
          }. received: nothing`,
        });
      }
    }

    return _parse(command.subcommands, rest, context);
  }
};
