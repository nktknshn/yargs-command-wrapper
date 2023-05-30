import { Command } from "../command/";
import { HandlerFunctionFor } from "./types-handler";

/**
 * @description Gets command's handler args type
 */
export type GetCommandArgv<TCommand extends Command> = Parameters<
  HandlerFunctionFor<TCommand>
>[0]["argv"];
