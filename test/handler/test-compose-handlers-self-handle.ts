import { expectTypeOf } from "expect-type";
import { vi } from "vitest";
import { buildAndParseUnsafeR, comp } from "../../src";
import { CommandArgsSelfHandle } from "../../src/command/commands/args/type-command-args";
import { EmptyRecord } from "../../src/common/types";
import { createHandlerFor } from "../../src/handler/create-handler-for/create-handler-for";
import { SelfHandlerKey } from "../../src/handler/create-handler-for/type-create-handler-for";
import { composeHandlers } from "../../src/handler/handler-composable/compose";
import { ComposableHandler } from "../../src/handler/handler-composable/type-composable-handler";
import { opt } from "../types/addOption";
import { com1, com2 } from "./fixtures";

describe("composable handler self handle", () => {
  test("self handle composed", () => {
    const cmd = comp(com1, com2).selfHandle(true);

    const com1com2handler = createHandlerFor(cmd, (args) => {
      expectTypeOf(args.command).toEqualTypeOf<"com1" | "com2" | undefined>();
      if (args.command === undefined) {
        expectTypeOf(args.argv).toEqualTypeOf<EmptyRecord>();
      }
      else {
        expectTypeOf(args.argv).toEqualTypeOf<{ a: string } | { c: string }>();
      }
    });

    expectTypeOf(com1com2handler).toEqualTypeOf<
      ComposableHandler<
        CommandArgsSelfHandle<EmptyRecord> | {
          command: "com1";
          argv: {
            a: string;
          };
        } | {
          command: "com2";
          argv: {
            c: string;
          };
        },
        readonly ["com2", "com1", SelfHandlerKey],
        "sync",
        void
      >
    >();
  });

  test("self handle composed 2", () => {
    const [com1fn, com2fn, selfFn] = [vi.fn(), vi.fn(), vi.fn()];
    const com1handler = createHandlerFor(com1, (args) => {
      com1fn(args);
    });
    const com2handler = createHandlerFor(com2, (args) => {
      com2fn(args);
    });

    const cmd = comp(opt("g"), com1, com2).selfHandle(true);

    const com2SelfHandler = createHandlerFor(cmd.$.$self, (args) => {
      selfFn(args);
    });

    const com1com2handler = composeHandlers(
      com1handler,
      com2handler,
      com2SelfHandler,
    );

    com1com2handler.handle(
      buildAndParseUnsafeR(cmd, "com1 -a -g123"),
    );

    expect(com1fn).toBeCalledWith({ a: "", g: "123" });

    com1com2handler.handle(
      buildAndParseUnsafeR(cmd, "com2 -c -g123"),
    );

    expect(com2fn).toBeCalledWith({ c: "", g: "123" });

    com1com2handler.handle(
      buildAndParseUnsafeR(cmd, ["-g123"]),
    );

    expect(selfFn).toBeCalledWith({ g: "123" });
  });
});
