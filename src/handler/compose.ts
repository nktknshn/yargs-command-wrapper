import { CommandArgs } from "./handler";
import { _createHandler } from "./handler-for";
import {
  ComposableHandler,
  ComposeArgv,
  ComposedHandlerComposable,
  ComposeNames,
} from "./types";

/**
 * @description Composes handlers
 */

export type ComposedHandlers<THandlers extends readonly ComposableHandler[]> =
  ComposedHandlerComposable<ComposeNames<THandlers>, ComposeArgv<THandlers>>;

export function composeHandlers<THandlers extends readonly ComposableHandler[]>(
  ...handlers: THandlers
): ComposedHandlers<THandlers> {
  const supports: string[] = [];

  for (const h of handlers) {
    supports.push(...h.supports);
  }

  let _handler = (args: CommandArgs): void => {
    for (const h of handlers) {
      if (h.supports.includes(args.command)) {
        return h.handle(args);
      }
    }

    throw new Error(`No handler found for command ${args.command}`);
  };

  return _createHandler(_handler, supports) as ComposedHandlers<THandlers>;
}
