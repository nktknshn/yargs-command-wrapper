import { EmptyRecord } from "../../../common/types";
import { Command } from "../..";
import { showCommands } from "../helpers";
import { composedCommandNames, findByNameInComposed } from "./helpers";
import { HelperObjectComposed } from "./type";

export const createHelperObject = <
  TCommands extends readonly Command[],
  TArgv extends EmptyRecord,
>(
  commands: TCommands,
): HelperObjectComposed<TCommands, TArgv> => {
  const commandNames = composedCommandNames(commands);

  const commandsObject: Record<string, Command> = {};

  for (const name of commandNames) {
    const cmd = findByNameInComposed(commands, name);
    if (!cmd) {
      throw new Error(
        `Command ${name} not found in composed command ${
          showCommands(commands)
        }`,
      );
    }
    commandsObject[name] = cmd;
  }

  return {
    commands: commandsObject,
  } as HelperObjectComposed<TCommands, TArgv>;
};
