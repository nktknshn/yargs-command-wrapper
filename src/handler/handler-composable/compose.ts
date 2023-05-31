import { CommandArgs } from "../../command/commands/composed/type-command-args";
import { _createHandler } from "../create-handler-for/create-handler-for";
import { ComposableHandler } from "./type";
import { ComposedHandlers } from "./types-compose";

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
export function composeHandlers<THandlers extends readonly ComposableHandler[]>(
  ...handlers: THandlers
): ComposedHandlers<THandlers> {
  const supports: string[] = [];

  for (const h of handlers) {
    supports.push(...h.supports);
  }

  const _handler = (args: CommandArgs): unknown | Promise<unknown> => {
    for (const h of handlers) {
      if (h.supports.includes(args.command)) {
        return h.handle(args);
      }
    }

    throw new Error(`No handler found for command ${args.command}`);
  };

  return _createHandler(_handler, supports) as ComposedHandlers<THandlers>;
}
