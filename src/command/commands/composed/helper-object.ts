import { WrapperError } from "../../../common/error";
import { EmptyRecord } from "../../../common/types";
import { Command } from "../..";
import { showCommands } from "../helpers";
import { composedCommandNames, findByNameInComposed } from "./helpers";
import { HelperCommands } from "./type-command-composed";

export const createHelperCommands = <
  TCommands extends readonly Command[],
  TArgv extends EmptyRecord,
>(
  commands: TCommands,
): HelperCommands<TCommands, TArgv> => {
  const commandNames = composedCommandNames(commands);

  const commandsObject: Record<string, Command> = {};

  for (const name of commandNames) {
    const cmd = findByNameInComposed(commands, name);
    if (!cmd) {
      throw WrapperError.create(
        `Command ${name} not found in composed command ${
          showCommands(commands)
        }`,
      );
    }
    commandsObject[name] = cmd;
  }

  return {
    commands: commandsObject,
  } as HelperCommands<TCommands, TArgv>;
};
