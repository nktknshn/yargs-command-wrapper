import { EmptyRecord } from "../../../common/types";
import { CommandsTuple, YargsCommandBuilder } from "../../types";
import { createHelperCommands } from "./helper-object";
import { CommandComposed, HelperCommandCompose } from "./type-command-composed";

export type DefaultProps = {
  readonly selfHandle: false;
};

/**
 * @description Create a command that can be one of the `commands`
 * @param
 * @returns
 */
export function composeCommands<
  TCommands extends CommandsTuple,
  TArgv extends EmptyRecord,
>(
  builder: YargsCommandBuilder<TArgv>,
  ...commands: TCommands
):
  & CommandComposed<TCommands, TArgv, DefaultProps>
  & { $: HelperCommandCompose<TCommands, TArgv, DefaultProps> };

export function composeCommands<
  TCommands extends CommandsTuple,
  TArgv extends EmptyRecord = EmptyRecord,
>(
  ...commands: TCommands
):
  & CommandComposed<TCommands, TArgv, DefaultProps>
  & { $: HelperCommandCompose<TCommands, TArgv, DefaultProps> };

export function composeCommands<
  TCommands extends CommandsTuple,
  TArgv extends EmptyRecord,
>(
  builder: YargsCommandBuilder<TArgv> | TCommands,
  ...commands: TCommands
):
  & CommandComposed<TCommands, TArgv, DefaultProps>
  & { $: HelperCommandCompose<TCommands, TArgv, DefaultProps> }
{
  let _builder = undefined;

  if (typeof builder !== "function") {
    commands = [builder, ...commands] as unknown as TCommands;
    _builder = undefined;
  }
  else {
    _builder = builder;
  }

  const resultCommand: CommandComposed<TCommands, TArgv, DefaultProps> = {
    commands,
    builder: _builder,
    type: "composed",
    props: { selfHandle: false },
  } as const;

  const helperObject = createHelperCommands<TCommands, TArgv>(
    resultCommand.commands,
  );

  return {
    ...resultCommand,
    $: {
      ...helperObject,
      selfHandle: value => ({ ...resultCommand, props: { selfHandle: value } }),
    },
  };
}
