import { expectTypeOf } from "expect-type";
import { vi } from "vitest";
import { createHandlerFor } from "../../../src/handler/create-handler-for/create-handler-for";
import { com1, deepNested, s1s2comp, subsCommand } from "../fixtures";

describe("createHandlerFor", () => {
  test("basic command", () => {
    const fn = vi.fn();

    const handler = createHandlerFor(com1, (args) => {
      fn(args);
      args.a;
    });

    handler.handle({ command: "com1", argv: { a: "123" } });

    expect(fn).toBeCalledWith({ a: "123" });
  });

  test("subs basic", () => {
    createHandlerFor(subsCommand, {
      "subsub1": (args) => {
        args.sub3argv;
        args.subsub1argv;
      },
      "subsub2": (args) => {
        args.sub3argv;
        args.subsub2argv;
      },
    });

    createHandlerFor(subsCommand, (args) => {
      expectTypeOf(args.command).toEqualTypeOf<"subsub1" | "subsub2">();
    });
  });

  test("subs composed handler 0", () => {
    const [fn1, fn2] = [vi.fn(), vi.fn()];

    const s1s2compHandler = createHandlerFor(s1s2comp, {
      "subsub1": (args) => {
        fn1(args);
      },
      "subsub2": (args) => {},
    });

    const sub3handler = createHandlerFor(subsCommand, s1s2compHandler);

    sub3handler.handle({
      command: "sub3",
      subcommand: "subsub1",
      argv: { sub3argv: "123", subsub1argv: "456" },
    });

    expect(fn1).toBeCalledWith({
      sub3argv: "123",
      subsub1argv: "456",
    });
  });

  test("subs composed handler 1", () => {
    const [fn1, fn2] = [vi.fn(), vi.fn()];

    const s1s2compHandler = createHandlerFor(s1s2comp, {
      "subsub1": (args) => {
        fn1(args);
      },
      "subsub2": (args) => {},
    });

    const sub3handler = createHandlerFor(subsCommand, s1s2compHandler);

    const handler = createHandlerFor(deepNested, {
      "sub1": () => 1,
      "sub2": () => "123",
      "sub3": sub3handler,
    });

    handler.handle({
      command: "com4",
      subcommand: "sub3",
      subsubcommand: "subsub1",
      argv: { com4argv: "123", sub3argv: "456", subsub1argv: "789" },
    });

    expect(fn1).toBeCalledWith({
      com4argv: "123",
      sub3argv: "456",
      subsub1argv: "789",
    });
  });

  test("subs composed handler 2", () => {
    const [fn1, fn2] = [vi.fn(), vi.fn()];

    const s1s2compHandler = createHandlerFor(s1s2comp, {
      "subsub1": (args) => {
        fn1(args);
      },
      "subsub2": (args) => {},
    });

    const handler = createHandlerFor(deepNested, {
      "sub1": () => 1,
      "sub2": () => "123",
      "sub3": s1s2compHandler,
    });

    handler.handle({
      command: "com4",
      subcommand: "sub3",
      subsubcommand: "subsub1",
      argv: { com4argv: "123", sub3argv: "456", subsub1argv: "789" },
    });

    expect(fn1).toBeCalledWith({
      com4argv: "123",
      sub3argv: "456",
      subsub1argv: "789",
    });
  });
});
