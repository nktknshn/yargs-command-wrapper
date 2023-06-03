import { CommandArgs } from "../../command/commands/args/type-command-args";
import { HandlerFunction } from "../handler-function/type";
import { ComposableHandler } from "./type";
import { ComposeArgv, ComposedHandlers, ComposeNames } from "./types-compose";

type C1 = ComposableHandler<
  ["com1"],
  { command: "com1"; argv: { a: number } },
  "sync",
  void
>;

type H = ComposedHandlers<[
  ComposableHandler<
    ["com1"],
    { command: "com1"; argv: { a: number } },
    "sync",
    void
  >,
  ComposableHandler<
    ["com2"],
    { command: "com2"; argv: { b: number } },
    "sync",
    void
  >,
  ComposableHandler<
    ["com3"],
    { command: "com3"; argv: { c: number } },
    "sync",
    void
  >,
]>;

type CompHand = ComposableHandler<readonly string[], CommandArgs>;
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
  const supports: string[] = [];

  for (const h of handlers) {
    supports.push(...h.supports);
  }

  const _handler = (
    args: ComposeArgv<[CompHand]>,
  ): unknown | Promise<unknown> => {
    for (const h of handlers) {
      if (typeof args.command === "string") {
        if (h.supports.includes(args.command)) {
          return h.handle(args);
        }
      }
    }

    throw new Error(`No handler found for command ${String(args.command)}`);
  };

  return {
    handle: _handler,
    supports: supports,
  };
}

// type CC = readonly [string] extends readonly [string, string] ? true : false;
