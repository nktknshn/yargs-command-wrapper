import { EmptyRecord } from "../../common/types";
import { CommandBasic } from "./basic/type";
import { GetBasicParseResult } from "./basic/type-parse-result";
import { Command } from "./command";
import { CommandComposed } from "./composed/type";
import { GetComposedParseResult } from "./composed/type-parse-result";
import { CommandComposedWithSubcommands } from "./with-subcommands/type";
import { GetWithSubcommandsParseResult } from "./with-subcommands/type-parse-result";

/**
 * @description Gets the return type of a parsed arguments
 */
export type GetCommandParseResult<
  TCommand extends Command,
  TGlobalArgv = EmptyRecord,
> = TCommand extends CommandBasic ? GetBasicParseResult<TCommand, TGlobalArgv>
  : TCommand extends CommandComposed
    ? GetComposedParseResult<TCommand, TGlobalArgv>
  : TCommand extends CommandComposedWithSubcommands
    ? GetWithSubcommandsParseResult<TCommand, TGlobalArgv>
  : never;

type A = GetCommandParseResult<Command>;
