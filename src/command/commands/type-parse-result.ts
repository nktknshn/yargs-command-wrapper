import { BasicCommand } from "./basic/type";
import { GetBasicParseResult } from "./basic/type-parse-result";
import { Command } from "./command";
import { ComposedCommands } from "./composed/type";
import { GetComposedParseResult } from "./composed/type-parse-result";
import { CommandWithSubcommands } from "./with-subcommands/type";
import { GetWithSubcommandsParseResult } from "./with-subcommands/type-parse-result";

/**
 * @description Gets the return type of a parsed arguments
 */
export type GetCommandParseResult<TCommand extends Command, TGlobalArgv = {}> =
  TCommand extends BasicCommand ? GetBasicParseResult<TCommand, TGlobalArgv>
    : TCommand extends ComposedCommands
      ? GetComposedParseResult<TCommand, TGlobalArgv>
    : TCommand extends CommandWithSubcommands
      ? GetWithSubcommandsParseResult<TCommand, TGlobalArgv>
    : never;
