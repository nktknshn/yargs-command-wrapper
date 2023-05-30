import { BasicCommand } from "../basic/type";
import { Command } from "../command";
import { ComposedCommands, HelperObjectComposed } from "../composed/type";

export type CommandWithSubcommands<
  TCommandName extends string = string,
  TCommands extends readonly Command[] = readonly Command[],
  TArgv extends {} = {},
  TComposedArgv extends {} = {},
> = {
  readonly command: BasicCommand<TCommandName, TArgv>;
  readonly subcommands: ComposedCommands<TCommands, TComposedArgv>;
  readonly type: "with-subcommands";
};

export type HelperObjectWithSubcommands<
  TCommands extends readonly Command[],
  TArgv extends {},
> = HelperObjectComposed<TCommands, TArgv>;
