import { BasicCommand } from "../basic/type";
import { Command } from "../command";
import { ComposedCommands, HelperObjectComposed } from "../composed/type";

export type CommandWithSubcommands<
  TCommandName extends string = string,
  TCommands extends readonly Command[] = readonly Command[],
  TArgv extends {} = {},
  TComposedArgv extends {} = {},
> = {
  command: BasicCommand<TCommandName, TArgv>;
  subcommands: ComposedCommands<TCommands, TComposedArgv>;
  type: "with-subcommands";
};

export type HelperObjectWithSubcommands<
  TCommands extends readonly Command[],
  TArgv extends {},
> = HelperObjectComposed<TCommands, TArgv>;
