import {
  CommandBasic,
  CommandComposed,
  CommandComposedWithSubcommands,
} from "../command";
import { getCommandNameFromDesc } from "../command/commands/basic/helpers";
import { Command } from "../command/commands/command";
import * as E from "../common/either";
import { ErrorType } from "../common/error";

/**
 * @description Given a command and an alias try to find the full command name and the subcommands to look in if any
 * @param command
 * @returns Either an error or a tuple of the full command name and the subcommands if any
 */
// XXX used instead of findByNameInComposed
export const findAlias = (
  command: Command,
  alias: string,
): E.Either<
  ErrorType,
  | {
    fullName: string;
    currentCommand: CommandBasic;
    nextCommands: undefined;
    type: "command";
  }
  | {
    type: "with-subcommands";
    fullName: string;
    currentCommand: CommandComposedWithSubcommands;
    nextCommands: CommandComposed;
  }
> => {
  if (command.type === "command") {
    for (const cmd of command.commandDesc) {
      // console.log(`cmd: ${cmd}, ${alias}`);
      if (cmd == alias) {
        return E.of({
          type: "command",
          fullName: getCommandNameFromDesc(command.commandDesc[0]),
          currentCommand: command,
          nextCommands: undefined,
        });
      }
      else if (cmd.startsWith(`${alias} `)) {
        return E.of({
          type: "command",
          fullName: alias,
          currentCommand: command,
          nextCommands: undefined,
        });
      }
    }
  }
  else if (command.type === "with-subcommands") {
    if (command.command.commandDesc.includes(alias)) {
      return E.of(
        {
          type: "with-subcommands",
          fullName: command.command.commandDesc[0],
          currentCommand: command,
          nextCommands: command.subcommands,
        },
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
