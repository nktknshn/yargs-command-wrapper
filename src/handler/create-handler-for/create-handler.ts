import { CommandArgs } from "../../../ignored/test-try-handler";
import { Command } from "../../command";
import { ComposableHandlerFor } from "../handler-composable/composable-handler-for";
import { ComposableHandler } from "../handler-composable/type";
import { HandlerFunction } from "../handler-function/type";
import { GetFunctionReturnType, GetFunctionSyncType } from "../type-helpers";

/**
 * @description Create a composable handler for a command.
 * @param handle A function that will handle the arguments.
 * @returns A composable handler.
 */
export function createHandler<
  TCommand extends Command,
  H extends ComposableHandlerFor<TCommand>["handle"],
>(
  handle: H,
  supports: readonly string[],
): ComposableHandlerFor<
  TCommand,
  GetFunctionSyncType<H>,
  GetFunctionReturnType<H>
>;

export function createHandler(
  handle: HandlerFunction<CommandArgs<never, never>>,
  supports: readonly string[],
): ComposableHandler {
  return { handle, supports };
}
