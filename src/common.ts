import { Command } from "./types";

/**
 * @description parses a command description and returns the command name
 * @param desc the command description
 * @returns the command name
 */
export const getCommandName = (desc: string): string => {
  return desc.includes(" ")
    ? desc.split(" ")[0]
    : desc;
};

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
