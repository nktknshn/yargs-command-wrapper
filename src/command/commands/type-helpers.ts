import { Command, GetCommandParseResult } from "..";

/**
 * @description Gets command's handler args type
 */
export type GetCommandArgv<TCommand extends Command> = GetCommandParseResult<
  TCommand
>["argv"];
