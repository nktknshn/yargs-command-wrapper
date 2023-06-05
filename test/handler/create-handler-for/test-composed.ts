import { vi } from "vitest";
import { comp } from "../../../src";
import { createHandlerFor } from "../../../src/handler/create-handler-for/create-handler-for";
import { com1, com2, com2com3, com3, s1s2comp, subsCommand } from "../fixtures";

describe("createHandlerFor composed", () => {
  test("basic command", () => {
    const fn = vi.fn();

    const handler = createHandlerFor(com1, (args) => {
      fn(args);
      args.a;
    });

    handler.handle({ command: "com1", argv: { a: "123" } });

    expect(fn).toBeCalledWith({ a: "123" });
  });

  test("composed command from a function", () => {
    const [fn1, fn2] = [vi.fn(), vi.fn()];

    const handler1 = createHandlerFor(com2com3, (args) => {
      if (args.command === "com2") {
        fn1(args);
        args.argv.c;
      }
      else if (args.command === "com3") {
        fn2(args);
        args.argv.d;
      }
    });

    handler1.handle({ command: "com2", argv: { c: "123" } });
    expect(fn1).toBeCalledWith({ command: "com2", argv: { c: "123" } });

    handler1.handle({ command: "com3", argv: { d: "123" } });
    expect(fn2).toBeCalledWith({ command: "com3", argv: { d: "123" } });
  });

  test("composed command from a record", () => {
    const [fn1, fn2] = [vi.fn(), vi.fn()];

    const handler1 = createHandlerFor(com2com3, {
      "com2": (args) => {
        args.c;
        fn1(args);
      },
      "com3": (args) => {
        args.d;
        fn2(args);
      },
    });

    handler1.handle({ command: "com2", argv: { c: "123" } });
    expect(fn1).toBeCalledWith({ c: "123" });

    handler1.handle({ command: "com3", argv: { d: "123" } });
    expect(fn2).toBeCalledWith({ d: "123" });
  });

  test("composed composed command from a record", () => {
    const [fn1, fn2, fn3] = [vi.fn(), vi.fn(), vi.fn()];

    const handler1 = createHandlerFor(
      comp(com1, com2com3),
      {
        "com1": (args) => {
          fn1(args);
        },
        "com2": (args) => {
          fn2(args);
        },
        "com3": (args) => {
          fn3(args);
        },
      },
    );
    handler1.handle({ command: "com1", argv: { a: "123" } });
    expect(fn1).toBeCalledWith({ a: "123" });

    handler1.handle({ command: "com2", argv: { c: "123" } });
    expect(fn2).toBeCalledWith({ c: "123" });

    handler1.handle({ command: "com3", argv: { d: "123" } });
    expect(fn3).toBeCalledWith({ d: "123" });
  });

  test("composed to subs function", () => {
    const [fn1, fn2] = [vi.fn(), vi.fn()];

    const _cmd = comp(com1, com2, subsCommand);

    const handler = createHandlerFor(_cmd, {
      "com1": () => {},
      "com2": () => {},
      "sub3": (args) => {
        if (args.command === "subsub1") {}
        if (args.command === "subsub2") {}
        fn1(args);
      },
    });

    handler.handle({
      command: "sub3",
      subcommand: "subsub1",
      argv: { sub3argv: "456", subsub1argv: "789" },
    });

    expect(fn1).toBeCalledWith({
      command: "subsub1",
      argv: { sub3argv: "456", subsub1argv: "789" },
    });
  });

  test("subs composed handler 3", () => {
    const [fn1, fn2] = [vi.fn(), vi.fn()];

    const s1s2compHandler = createHandlerFor(s1s2comp, {
      "subsub1": (args) => {
        fn1(args);
      },
      "subsub2": (args) => {},
    });

    const _cmd = comp(com1, com2, subsCommand);

    const handler = createHandlerFor(_cmd, {
      "com1": () => {},
      "com2": () => {},
      "sub3": s1s2compHandler,
    });

    handler.handle({
      command: "sub3",
      subcommand: "subsub1",
      argv: { sub3argv: "456", subsub1argv: "789" },
    });

    expect(fn1).toBeCalledWith({
      sub3argv: "456",
      subsub1argv: "789",
    });
  });

  test("composed structure mixed handlers", () => {
    const [hcom2, hcom3] = [vi.fn(), vi.fn()];

    const com2Handler = createHandlerFor(com2, (args) => {
      hcom2(args);
    });
    const com3Handler = createHandlerFor(com3, (args) => {
      hcom3(args);
    });

    const handler1 = createHandlerFor(com2com3, {
      "com2": com2Handler,
      "com3": com3Handler,
    });

    handler1.handle({ command: "com2", argv: { c: "123" } });
    expect(hcom2).toBeCalledWith({ c: "123" });

    handler1.handle({ command: "com3", argv: { d: "123" } });
    expect(hcom3).toBeCalledWith({ d: "123" });
  });
});
