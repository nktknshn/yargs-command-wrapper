import { EmptyRecord } from "../../common/types";
import { CommandBasic } from "./basic/type";
import { Command } from "./command";
import { CommandComposed } from "./composed/type-command-composed";
import { CommandComposedWithSubcommands } from "./with-subcommands/type";

/**
 * @description adds argv to a command.
 */
export type AddArgv<
  TCommand extends Command,
  TAddArgv extends EmptyRecord,
> = TCommand extends CommandBasic<infer TName, infer TArgv>
  ? CommandBasic<TName, TArgv & TAddArgv>
  : TCommand extends CommandComposed<infer TCommands, infer TArgv>
    ? CommandComposed<TCommands, TArgv>
  : TCommand extends CommandComposedWithSubcommands<
    infer TName,
    infer TCommands,
    infer TArgv,
    infer TComposedArgv
  > ? CommandComposedWithSubcommands<
      TName,
      TCommands,
      TArgv & TAddArgv,
      TComposedArgv
    >
  : never;
