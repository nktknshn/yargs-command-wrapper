import { Command } from "../..";
import { CommandsTuple } from "../../types";
import { composedCommandNames, findByNameInComposed } from "./helpers";
import { HelperObjectComposed } from "./type";

export const createHelperObject = <
  TCommands extends CommandsTuple,
  TArgv extends {},
>(
  commands: TCommands,
): HelperObjectComposed<TCommands, TArgv> => {
  const commandNames = composedCommandNames(commands);

  const commandsObject: Record<string, Command> = {};

  for (const name of commandNames) {
    const cmd = findByNameInComposed(commands, name);
    if (!cmd) {
      throw new Error(
        `Command ${name} not found in composed command ${commands}`,
      );
    }
    commandsObject[name] = cmd;
  }

  return {
    commands: commandsObject,
  } as HelperObjectComposed<TCommands, TArgv>;
};
