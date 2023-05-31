import { CommandBasic } from "./basic/type";
import { CommandComposed as CommandComposed } from "./composed/type";
import { CommandComposedWithSubcommands } from "./with-subcommands/type";

export type NamedCommand = CommandComposedWithSubcommands | CommandBasic;

export type Command =
  | CommandBasic<string, {}>
  | CommandComposed<readonly Command[], {}>
  | CommandComposedWithSubcommands<string, readonly Command[]>;
