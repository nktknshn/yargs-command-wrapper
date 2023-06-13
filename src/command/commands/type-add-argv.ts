import { EmptyRecord } from "../../common/types";
import { CommandBasic } from "./basic/type";
import { Command } from "./command";
import { CommandComposed } from "./composed/type-command-composed";
import { CommandComposedWithSubcommands } from "./with-subcommands/type-subs";

/**
 * @description extend command's argv.
 */
export type AddArgv<
  TCommand extends Command,
  TAddArgv extends EmptyRecord,
> = TCommand extends CommandBasic<infer TName, infer TArgv>
  ? CommandBasic<TName, TArgv & TAddArgv>
  : TCommand extends
    CommandComposed<infer TCommands, infer TArgv, infer TComposedProps>
    ? CommandComposed<TCommands, TArgv & TAddArgv, TComposedProps>
  : TCommand extends CommandComposedWithSubcommands<
    infer TName,
    infer TCommands,
    infer TArgv,
    infer TComposedArgv,
    infer TSubsProps,
    infer TComposedProps
  > ? CommandComposedWithSubcommands<
      TName,
      TCommands,
      TArgv & TAddArgv,
      TComposedArgv,
      TSubsProps,
      TComposedProps
    >
  : never;
