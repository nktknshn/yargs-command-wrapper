import { EmptyRecord } from "../../common/types";
import { CommandBasic } from "./basic/type";
import { GetBasicCommandArgs } from "./basic/type-parse-result";
import { Command } from "./command";
import { CommandComposed } from "./composed/type";
import { GetComposedCommandArgs } from "./composed/type-parse-result";
import { CommandComposedWithSubcommands } from "./with-subcommands/type";
import { GetWithSubcommandsArgs } from "./with-subcommands/type-parse-result";

/**
 * @description Gets the return type of a parsed arguments
 */
export type GetCommandArgs<
  TCommand extends Command,
  TGlobalArgv = EmptyRecord,
> = TCommand extends CommandBasic ? GetBasicCommandArgs<TCommand, TGlobalArgv>
  : TCommand extends CommandComposed
    ? GetComposedCommandArgs<TCommand, TGlobalArgv>
  : TCommand extends CommandComposedWithSubcommands
    ? GetWithSubcommandsArgs<TCommand, TGlobalArgv>
  : never;
