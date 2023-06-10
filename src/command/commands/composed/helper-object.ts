import { WrapperError } from "../../../common/error";
import { EmptyRecord } from "../../../common/types";
import { SelfHandlerKey } from "../../../handler/create-handler-for/type-create-handler-for";
import { Command } from "../..";
import { command } from "../basic/command";
import { showCommands } from "../helpers";
import { composedCommandNames, findByNameInComposed } from "./helpers";
import { ComposedProps, HelperCommands } from "./type-command-composed";

export const createCommandsRecord = <
  TCommands extends readonly Command[],
  TArgv extends EmptyRecord,
  TProps extends ComposedProps,
>(
  commands: TCommands,
  props: TProps,
): HelperCommands<TCommands, TArgv, TProps> => {
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

  if (props.selfHandle) {
    commandsObject[SelfHandlerKey] = command(SelfHandlerKey, SelfHandlerKey);
  }

  return {
    commands: commandsObject,
  } as HelperCommands<TCommands, TArgv, TProps>;
};
