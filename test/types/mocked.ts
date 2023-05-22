import { buildAndParseUnsafeR as _buildAndParseUnsafe } from "../../src";
import { Command, GetCommandReturnType } from "../../src/types";

export const buildAndParseUnsafe = <TCommand extends Command>(
  command: TCommand,
  arg?: string | readonly string[],
): GetCommandReturnType<TCommand> => {
  return {} as GetCommandReturnType<TCommand>;
};
