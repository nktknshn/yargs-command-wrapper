import { EmptyRecord } from "../../../common/types";
import { CommandBasic } from "../basic/type";
import { Command } from "../command";
import {
  CommandComposed,
  ComposedProps,
  HelperCommands,
} from "../composed/type-command-composed";

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

export type HelperObjectWithSubcommands<
  TCommand extends CommandComposedWithSubcommands,
> = TCommand extends CommandComposedWithSubcommands<
  infer TName,
  infer TCommands,
  infer TArgv,
  infer TComposedArgv,
  infer TSubsProps,
  infer TComposedProps
> ? 
    & HelperCommands<TCommands, TArgv>
    & {
      selfHandle: <B extends boolean>(
        value: B,
      ) => CommandComposedWithSubcommands<
        TName,
        TCommands,
        TArgv,
        TComposedArgv,
        { selfHandle: B },
        TComposedProps
      >;
    }
  : never;
