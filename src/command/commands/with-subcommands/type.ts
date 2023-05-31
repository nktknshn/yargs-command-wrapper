import { EmptyRecord } from "../../../common/types";
import { CommandBasic } from "../basic/type";
import { Command } from "../command";
import { CommandComposed, HelperObjectComposed } from "../composed/type";

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
> = {
  readonly command: CommandBasic<TCommandName, TArgv>;
  readonly subcommands: CommandComposed<TCommands, TComposedArgv>;
  readonly type: "with-subcommands";
};

export type HelperObjectWithSubcommands<
  TCommands extends readonly Command[],
  TArgv extends EmptyRecord,
> = HelperObjectComposed<TCommands, TArgv>;
