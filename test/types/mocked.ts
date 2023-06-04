import { buildAndParseUnsafeR as _buildAndParseUnsafe } from "../../src";
import { GetCommandArgs } from "../../src/command/";
import { Command } from "../../src/command/commands/command";

export const buildAndParseUnsafe = <TCommand extends Command>(
  command: TCommand,
  arg?: string | readonly string[],
): GetCommandArgs<TCommand> => {
  return {} as GetCommandArgs<TCommand>;
};
