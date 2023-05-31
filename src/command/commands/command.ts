import { EmptyRecord } from "../../common/types";
import { CommandBasic } from "./basic/type";
import { CommandComposed as CommandComposed } from "./composed/type";
import { CommandComposedWithSubcommands } from "./with-subcommands/type";

export type NamedCommand = CommandComposedWithSubcommands | CommandBasic;

export type Command =
  | CommandBasic<string, EmptyRecord>
  | CommandComposed<readonly Command[], EmptyRecord>
  | CommandComposedWithSubcommands<string, readonly Command[]>;
