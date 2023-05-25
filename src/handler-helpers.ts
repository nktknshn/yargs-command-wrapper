import { Command, ComposedCommands } from "./types";

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
