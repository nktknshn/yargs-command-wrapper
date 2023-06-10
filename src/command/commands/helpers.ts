import { Command } from "./command";

export const showCommand = <TCommand extends Command>(
  command: TCommand,
  verbose = false,
): string => {
  if (command.type === "command") {
    if (!verbose) {
      return `command(${command.commandName})`;
    }
    return `command(${command.commandName}, ${command.description})`;
  }
  else if (command.type === "with-subcommands") {
    if (!verbose) {
      return `subcommands(${command.command.commandName})`;
    }
    return `subcommands(${command.command.commandName}, ${
      command.subcommands.commands.map(_ => showCommand(_, false)).join(", ")
    })`;
  }
  else if (command.type === "composed") {
    if (!verbose) {
      return `composed(${
        command.commands.map(_ => getCommandNames(_)).join(", ")
      })`;
    }
    return `composed(${
      command.commands.map(_ => showCommand(_, false)).join(", ")
    })`;
  }
  else {
    return command;
  }
};

export const showCommands = (
  commands: readonly Command[],
  verbose = false,
): string => {
  return `commands(${commands.map(_ => showCommand(_, verbose)).join(", ")})`;
};

export const showCommandsNames = (commands: readonly Command[]): string => {
  return `commands(${commands.map(getCommandNames).join(", ")})`;
};

export const getCommandNames = (command: Command): string[] => {
  if (command.type === "command") {
    return [command.commandName];
  }
  else if (command.type === "composed") {
    return command.commands.flatMap(getCommandNames);
  }
  else {
    return [command.command.commandName];
  }
};
