import { Command, GetCommandArgs } from "..";

/**
 * @description Gets command's handler args type
 */
export type GetCommandArgv<TCommand extends Command> = GetCommandArgs<
  TCommand
>["argv"];
