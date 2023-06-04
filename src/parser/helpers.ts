import { getCommandNameFromDesc } from "../command/commands/basic/helpers";
import { Command } from "../command/commands/command";
import * as E from "../common/either";
import { ErrorType } from "../common/error";

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
