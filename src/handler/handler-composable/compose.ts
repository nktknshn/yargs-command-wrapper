import { CommandArgs } from "../../command/commands/args/type-command-args";
import { CommandName } from "../../command/commands/args/type-command-args-generic";
import { WrapperError } from "../../common/error";
import logging from "../../common/logging";
import { SelfHandlerKey } from "../create-handler-for/type-create-handler-for";
import { ComposableHandler } from "./type-composable-handler";
import { ComposeArgv, ComposedHandlers } from "./types-compose";

const logger = logging.getLogger("handler-composed");

type CompHand = ComposableHandler<CommandArgs, CommandName>;
/**
 * @description Composes handlers created by `createHandlerFor`
 * @example
 * ```ts
 *  const com1 = comm("com1", "description");
    const com2 = comm("com2", "description");
    const com1com2 = comp(com1, com2);

    const com1handler = createHandlerFor(com1, (args) => {});
    const com2handler = createHandlerFor(com2, (args) => {});
    const com1com2handler = composeHandlers(com1handler, com2handler);

    const { result } = buildAndParseUnsafe(com1com2, ["com1"]);

    com1com2handler.handle(result);
 * ```
 */
export function composeHandlers<
  THandlers extends readonly ComposableHandler[],
>(
  ...handlers: THandlers
): ComposedHandlers<THandlers>;

export function composeHandlers(
  ...handlers: CompHand[]
): ComposedHandlers<[CompHand]> {
  const supports: CommandName[] = [];

  for (const h of handlers) {
    supports.push(...h.supports);
  }

  const _handler = (
    args: ComposeArgv<[CompHand]>,
  ): unknown | Promise<unknown> => {
    logger.debug(`Composed handler for ${args.command ?? "undefined"}`, args);

    for (const h of handlers) {
      if (h.supports.includes(args.command ?? SelfHandlerKey)) {
        return h.handle(args);
      }
    }

    throw WrapperError.create(
      `No handler found for command ${String(args.command)}`,
    );
  };

  return {
    handle: _handler,
    supports: supports,
  };
}
