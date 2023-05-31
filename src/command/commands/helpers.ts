import { Command } from "./command";

export const showCommand = <TCommand extends Command>(
  command: TCommand,
): string => {
  if (command.type === "command") {
    return `command(${command.commandName}, ${command.description})`;
  }
  else if (command.type === "with-subcommands") {
    return `with-subcommands(${command.command.commandName}, ${
      command.subcommands.commands.map(showCommand).join(", ")
    })`;
  }
  else if (command.type === "composed") {
    return `composed(${command.commands.map(showCommand).join(", ")})`;
  }
  else {
    return command;
  }
};

export const showCommands = (commands: readonly Command[]): string => {
  return `commands(${commands.map(showCommand).join(", ")})`;
};
