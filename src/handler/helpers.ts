import {
  BasicCommand,
  Command,
  CommandWithSubcommands,
  ComposedCommands,
} from "../types";

/**
 * @description Traverses composed commands tree and returns command with given name
 */

export const findByNameInComposed = (
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
      const found = findByNameInComposed(command.commands, name);

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

export function composedCommandNames<TCommand extends ComposedCommands>(
  command: TCommand,
): string[] {
  const result: string[] = [];

  for (const c of command.commands) {
    if (c.type === "composed") {
      result.push(...composedCommandNames(c));
    }
    else if (c.type === "with-subcommands") {
      result.push(c.command.commandName);
    }
    else {
      result.push(c.commandName);
    }
  }

  return result;
}
