import { EmptyRecord } from "../../../common/types";
import { YargsCommandBuilder } from "../../types";
import { Command } from "../command";
import { createCommandsRecord } from "./helper-object";

/**
 * @description Properties of a command with subcommands.
 */
export type ComposedProps<TSelfHandle extends boolean = boolean> = {
  readonly selfHandle: TSelfHandle;
};

/**
 * @description composes multiple commands into a single command.
 */
export type CommandComposed<
  TCommands extends readonly Command[] = readonly Command[],
  TArgv extends EmptyRecord = EmptyRecord,
  TComposedProps extends ComposedProps = ComposedProps,
> = {
  readonly commands: TCommands;
  readonly builder?: YargsCommandBuilder<TArgv>;
  readonly props: TComposedProps;
  readonly type: "composed";
};

export class CommandComposedImpl<
  TCommands extends readonly Command[],
  TArgv extends EmptyRecord,
  TComposedProps extends ComposedProps,
> implements CommandComposed<TCommands, TArgv, TComposedProps> {
  readonly type = "composed";

  constructor(
    readonly commands: TCommands,
    readonly props: TComposedProps,
    readonly builder?: YargsCommandBuilder<TArgv>,
  ) {}

  selfHandle<B extends boolean>(value: B): CommandComposedImpl<
    TCommands,
    TArgv,
    { selfHandle: B }
  > {
    return new CommandComposedImpl(
      this.commands,
      { selfHandle: value },
      this.builder,
    );
  }

  $ = createCommandsRecord<TCommands, TArgv, TComposedProps>(
    this.commands,
    this.props,
  ).commands;
}
