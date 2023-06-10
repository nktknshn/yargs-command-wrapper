import { EmptyRecord } from "../../../common/types";
import { CommandsTuple, YargsCommandBuilder } from "../../types";
import { createCommandsRecord } from "./helper-object";
import { CommandComposed, ComposedProps } from "./type-command-composed";
import { CommandComposedImpl } from "./type-command-composed-class";
import { HelperCommandCompose } from "./type-helper-command-compose";

export type DefaultProps = {
  readonly selfHandle: false;
};

export type ComposeCommandsResult<
  TCommands extends CommandsTuple,
  TArgv extends EmptyRecord,
  TProps extends ComposedProps,
> = CommandComposedImpl<TCommands, TArgv, TProps>;

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
): ComposeCommandsResult<TCommands, TArgv, DefaultProps>;

export function composeCommands<
  TCommands extends CommandsTuple,
  TArgv extends EmptyRecord = EmptyRecord,
>(
  ...commands: TCommands
): ComposeCommandsResult<TCommands, TArgv, DefaultProps>;

export function composeCommands<
  TCommands extends CommandsTuple,
  TArgv extends EmptyRecord,
>(
  builder: YargsCommandBuilder<TArgv> | TCommands,
  ...commands: TCommands
): ComposeCommandsResult<TCommands, TArgv, DefaultProps> {
  let _builder: YargsCommandBuilder<TArgv> | undefined = undefined;

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

  return new CommandComposedImpl(
    resultCommand.commands,
    resultCommand.props,
    resultCommand.builder,
  );
}
