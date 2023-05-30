import { buildAndParseUnsafeR as _buildAndParseUnsafe } from "../../src";
import { GetCommandParseResult } from "../../src/command/";
import { Command } from "../../src/command/commands/command";

export const buildAndParseUnsafe = <TCommand extends Command>(
  command: TCommand,
  arg?: string | readonly string[],
): GetCommandParseResult<TCommand> => {
  return {} as GetCommandParseResult<TCommand>;
};
