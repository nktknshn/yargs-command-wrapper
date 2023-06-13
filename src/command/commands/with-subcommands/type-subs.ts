import { EmptyRecord } from "../../../common/types";
import { CommandBasic } from "../basic/type";
import { Command } from "../command";
import { createCommandsRecord } from "../composed/helper-object";
import {
  CommandComposed,
  ComposedProps,
} from "../composed/type-command-composed";
import { SelfHandledU } from "../type-helpers";

/**
 * @description Properties of a command with subcommands.
 */
export type SubsProps<TSelfHandle extends boolean = boolean> = {
  readonly selfHandle: TSelfHandle;
};

/**
 * @description defines a command with subcommands.
 */
export type CommandComposedWithSubcommands<
  TCommandName extends string = string,
  TCommands extends readonly Command[] = readonly Command[],
  /**
   * @description the argv type of the parent command.
   */
  TArgv extends EmptyRecord = EmptyRecord,
  /**
   * @description if the command is constructed from a composed command, this is the argv type of this command.
   */
  TComposedArgv extends EmptyRecord = EmptyRecord,
  TSubsProps extends SubsProps = SubsProps,
  TComposedProps extends ComposedProps = ComposedProps,
> = {
  readonly command: CommandBasic<TCommandName, TArgv>;
  readonly subcommands: CommandComposed<
    TCommands,
    TComposedArgv,
    TComposedProps
  >;
  readonly props: TSubsProps;
  readonly type: "with-subcommands";
};

export class CommandComposedWithSubcommandsImpl<
  TCommandName extends string,
  TCommands extends readonly Command[],
  TArgv extends EmptyRecord,
  TComposedArgv extends EmptyRecord,
  TSubsProps extends SubsProps,
  TComposedProps extends ComposedProps,
> implements
  CommandComposedWithSubcommands<
    TCommandName,
    TCommands,
    TArgv,
    TComposedArgv,
    TSubsProps,
    TComposedProps
  >
{
  readonly type = "with-subcommands";

  constructor(
    readonly command: CommandBasic<TCommandName, TArgv>,
    readonly subcommands: CommandComposed<
      TCommands,
      TComposedArgv,
      TComposedProps
    >,
    readonly props: TSubsProps,
  ) {}

  selfHandle<B extends boolean>(value: B): CommandComposedWithSubcommandsImpl<
    TCommandName,
    TCommands,
    TArgv,
    TComposedArgv,
    { selfHandle: B },
    TComposedProps
  > {
    return new CommandComposedWithSubcommandsImpl(
      this.command,
      this.subcommands,
      { selfHandle: value },
    );
  }

  $ = createCommandsRecord<
    TCommands,
    TArgv & TComposedArgv,
    SelfHandledU<TSubsProps, TComposedProps>
  >(
    this.subcommands.commands,
    {
      selfHandle: this.props.selfHandle
        || this.subcommands.props.selfHandle,
    } as SelfHandledU<TSubsProps, TComposedProps>,
  ).commands;
}
