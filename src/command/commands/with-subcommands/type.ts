import { CommandBasic } from "../basic/type";
import { Command } from "../command";
import { CommandComposed, HelperObjectComposed } from "../composed/type";

/**
 * @description defines a command with subcommands.
 */
export type CommandComposedWithSubcommands<
  TCommandName extends string = string,
  TCommands extends readonly Command[] = readonly Command[],
  TArgv extends {} = {},
  TComposedArgv extends {} = {},
> = {
  readonly command: CommandBasic<TCommandName, TArgv>;
  readonly subcommands: CommandComposed<TCommands, TComposedArgv>;
  readonly type: "with-subcommands";
};

export type HelperObjectWithSubcommands<
  TCommands extends readonly Command[],
  TArgv extends {},
> = HelperObjectComposed<TCommands, TArgv>;
