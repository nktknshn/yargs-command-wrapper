import { CommandsTuple, YargsCommandBuilder } from "../../types";
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
    $: {} as any,
  };
}
