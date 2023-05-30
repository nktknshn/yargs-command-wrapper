import { getCommandNameFromDesc } from "../command/commands/basic/helpers";
import { Command } from "../command/commands/command";
import * as E from "../common/either";
import { ErrorType } from "../common/error";

export const pushCommand = (
  args: Record<string, unknown>,
  command: string,
) => {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(args)) {
    if (key == "argv") {
      result[key] = value;
    }
    else if (key.endsWith("command")) {
      result[`sub${key}`] = value;
    }
  }

  result["command"] = command;

  return result;
};

export const appendSubcommand = (
  args: Record<string, unknown>,
  subcommand: string,
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  let longest = "command" in args ? "command" : "";

  for (const [key, value] of Object.entries(args)) {
    if (key == "argv") {
      result[key] = value;
    }
    else if (key.endsWith("command")) {
      if (key.length > longest.length) {
        longest = key;
      }
      result[key] = value;
    }
  }

  if (longest == "") {
    result["command"] = subcommand;
  }
  else {
    result[`sub${longest}`] = subcommand;
  }

  return result;
};

/**
 * @description Given a command and an alias, if the alias is found in the command
 * @param command
 * @returns Either an error or a tuple of the full command name and the subcommands if any
 */

export const findAlias = <TCommand extends Command>(
  command: TCommand,
  alias: string,
): E.Either<ErrorType, [string, Command | undefined]> => {
  if (command.type === "command") {
    for (const cmd of command.commandDesc) {
      // console.log(`cmd: ${cmd}, ${alias}`);
      if (cmd == alias) {
        return E.of([
          getCommandNameFromDesc(command.commandDesc[0]),
          undefined,
        ]);
      }
      else if (cmd.startsWith(`${alias} `)) {
        return E.of([alias, undefined]);
      }
    }
  }
  else if (command.type === "with-subcommands") {
    if (command.command.commandDesc.includes(alias)) {
      return E.of(
        [command.command.commandDesc[0], command.subcommands],
      );
    }
  }
  else if (command.type === "composed") {
    for (const cmd of command.commands) {
      // console.log(`cmd: ${showCommand(cmd)}`);
      const found = findAlias(cmd, alias);

      if (E.isRight(found)) {
        return found;
      }
    }
  }

  return E.left({
    error: "command not found",
    message: `Alias ${alias} was not found in any command ${command.type}`,
  });
};
