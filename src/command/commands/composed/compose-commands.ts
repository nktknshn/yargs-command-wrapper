import { Command } from "../..";
import { CommandsTuple, YargsCommandBuilder } from "../../types";
import { composedCommandNames, findByNameInComposed } from "./helpers";
import { ComposedCommands, HelperObjectComposed } from "./type";

/**
 * @description Create a command that can be one of the `commands`
 * @param
 * @returns
 */
export function composeCommands<
  TCommands extends CommandsTuple,
  TArgv extends {},
>(
  builder: YargsCommandBuilder<TArgv>,
  ...commands: TCommands
):
  & ComposedCommands<TCommands, TArgv>
  & { $: HelperObjectComposed<TCommands, TArgv> };

export function composeCommands<
  TCommands extends CommandsTuple,
  TArgv extends {} = {},
>(
  ...commands: TCommands
):
  & ComposedCommands<TCommands, TArgv>
  & { $: HelperObjectComposed<TCommands, TArgv> };

export function composeCommands<
  TCommands extends CommandsTuple,
  TArgv extends {},
>(
  builder: YargsCommandBuilder<TArgv> | TCommands,
  ...commands: TCommands
):
  & ComposedCommands<TCommands, TArgv>
  & { $: HelperObjectComposed<TCommands, TArgv> }
{
  let _builder = undefined;

  if (typeof builder !== "function") {
    commands = [builder, ...commands] as unknown as TCommands;
    _builder = undefined;
  }
  else {
    _builder = builder;
  }

  return {
    commands,
    builder: _builder,
    type: "composed",
    $: createHelperObject(commands),
  };
}

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
