import { BasicCommand } from "./basic/type";
import { ComposedCommands } from "./composed/type";
import { CommandWithSubcommands } from "./with-subcommands/type";

export type NamedCommand = CommandWithSubcommands | BasicCommand;

export type Command =
  | BasicCommand<string, {}>
  | ComposedCommands<readonly Command[], {}>
  | CommandWithSubcommands<string, readonly Command[]>;
