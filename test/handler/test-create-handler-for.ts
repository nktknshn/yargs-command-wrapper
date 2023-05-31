import { expectTypeOf } from "expect-type";
import { comm, comp, subs } from "../../src";
import { createHandlerFor } from "../../src/handler/create-handler-for/create-handler-for";
import { opt } from "../types/addOption";

export const com1 = comm("com1", "description", opt("a"));
export const com2 = comm("com2", "description", opt("c"));
export const com3 = comm("com3", "description", opt("d"));

export const com1com2 = comp(com1, com2);
export const com2com3 = comp(com2, com3);

const sub1 = comm("sub1", "sub1", opt("sub1argv"));
const sub2 = comm("sub2", "sub2", opt("sub2argv"));

const subsub1 = comm("subsub1", "subsub1", opt("subsub1argv"));
const subsub2 = comm("subsub2", "subsub2", opt("subsub2argv"));

export const s1s2comp = comp(subsub1, subsub2);

export const sub3 = subs(comm("sub3", "sub3", opt("sub3argv")), [
  subsub1,
  subsub2,
]);

/**
 * @description com4: sub1 sub2 sub3
 */
export const command3 = subs(
  comm("com4", "com4", opt("com4argv")),
  [sub1, sub2, sub3],
);

const composedCommand = comp(com1, com2com3, command3);

describe("handlerFor", () => {
  test("basic", () => {
    const fn = jest.fn();

    const handler = createHandlerFor(com1, (args) => {
      fn(args);
      args.a;
    });

    handler.handle({ command: "com1", argv: { a: "123" } });

    expect(fn).toBeCalledWith({ a: "123" });
  });

  test("composed function", () => {
    const [fn1, fn2] = [jest.fn(), jest.fn()];

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

  test("composed structure", () => {
    const [fn1, fn2] = [jest.fn(), jest.fn()];

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

  test("composed structure mixed handlers", () => {
    const [hcom2, hcom3] = [jest.fn(), jest.fn()];

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

  test("composed structure 2", () => {
    const [fn1, fn2, fn3] = [jest.fn(), jest.fn(), jest.fn()];

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

  test("subs basic", () => {
    createHandlerFor(sub3, {
      "subsub1": (args) => {
        args.sub3argv;
        args.subsub1argv;
      },
      "subsub2": (args) => {
        args.sub3argv;
        args.subsub2argv;
      },
    });

    createHandlerFor(sub3, (args) => {
      expectTypeOf(args.command).toEqualTypeOf<"subsub1" | "subsub2">();
    });
  });

  test("subs composed handler 0", () => {
    const [fn1, fn2] = [jest.fn(), jest.fn()];

    const s1s2compHandler = createHandlerFor(s1s2comp, {
      "subsub1": (args) => {
        fn1(args);
      },
      "subsub2": (args) => {},
    });

    const sub3handler = createHandlerFor(sub3, s1s2compHandler);

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
    const [fn1, fn2] = [jest.fn(), jest.fn()];

    const s1s2compHandler = createHandlerFor(s1s2comp, {
      "subsub1": (args) => {
        fn1(args);
      },
      "subsub2": (args) => {},
    });

    const sub3handler = createHandlerFor(sub3, s1s2compHandler);

    const handler = createHandlerFor(command3, {
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
    const [fn1, fn2] = [jest.fn(), jest.fn()];

    const s1s2compHandler = createHandlerFor(s1s2comp, {
      "subsub1": (args) => {
        fn1(args);
      },
      "subsub2": (args) => {},
    });

    const handler = createHandlerFor(command3, {
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

  test("subs composed handler 3", () => {
    const [fn1, fn2] = [jest.fn(), jest.fn()];

    const s1s2compHandler = createHandlerFor(s1s2comp, {
      "subsub1": (args) => {
        fn1(args);
      },
      "subsub2": (args) => {},
    });

    const _cmd = comp(com1, com2, sub3);

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

  test("nested function handler", () => {
    const [fn1, fn2, fn3, fn4] = [jest.fn(), jest.fn(), jest.fn(), jest.fn()];

    const handler1 = createHandlerFor(command3, (args) => {
      fn1(args);
      args.command;

      if (args.command === "sub3") {
        args.subcommand;
      }
    });

    handler1.handle({
      command: "com4",
      subcommand: "sub1",
      argv: { sub1argv: "123", com4argv: "123" },
    });

    expect(fn1).toBeCalledWith({
      command: "com4",
      subcommand: "sub1",
      argv: { sub1argv: "123", com4argv: "123" },
    });
  });

  test("nested structure handler", () => {
    const [fn1, fn2, fn3, fn4] = [jest.fn(), jest.fn(), jest.fn(), jest.fn()];

    const sub3handler = createHandlerFor(sub3, {
      "subsub1": (args) => {
        fn1(args);
        args.sub3argv;
        args.subsub1argv;
      },
      "subsub2": (args) => {
        fn2(args);
        args.sub3argv;
        args.subsub2argv;
      },
    });

    const handler1 = createHandlerFor(command3, {
      "sub1": (args) => {},
      "sub2": (args) => {},
      "sub3": sub3handler,
    });

    handler1.handle({
      command: "com4",
      subcommand: "sub3",
      subsubcommand: "subsub1",
      argv: { sub3argv: "123", subsub1argv: "123", com4argv: "123" },
    });

    expect(fn1).toBeCalledWith({
      sub3argv: "123",
      subsub1argv: "123",
      com4argv: "123",
    });
  });

  test("nested record handler", () => {
    const [fn1, fn2, fn3, fn4] = [jest.fn(), jest.fn(), jest.fn(), jest.fn()];

    const handler1 = createHandlerFor(command3, {
      "sub1": (args) => {
        args.com4argv;
        args.sub1argv;
      },
      "sub2": (args) => {
        args.com4argv;
        args.sub2argv;
      },
      "sub3": (args) => {
        args.command;
      },
    });
  });

  test("nested structure handler 2", () => {
    const [fn1, fn2, fn3, fn4] = [jest.fn(), jest.fn(), jest.fn(), jest.fn()];

    const command34handler = createHandlerFor(command3, {
      "sub1": (args) => {},
      "sub2": (args) => {
        fn2(args);
      },
      "sub3": {
        "subsub1": (args) => {},
        "subsub2": (args) => {
          fn3(args);
        },
      },
    });

    const handler = createHandlerFor(composedCommand, {
      "com1": (args) => {},
      "com2": (args) => {},
      "com3": (args) => {
        fn1(args);
      },
      "com4": {
        "sub1": (args) => {},
        "sub2": (args) => {
          args.com4argv;
          args.sub2argv;
          fn2(args);
        },
        "sub3": {
          "subsub1": (args) => {},
          "subsub2": (args) => {
            args.com4argv;
            args.sub3argv;
            args.subsub2argv;
            fn3(args);
          },
        },
      },
    });

    handler.handle(
      { command: "com3", argv: { d: "123" } },
    );

    expect(fn1).toBeCalledWith({ d: "123" });

    handler.handle(
      {
        command: "com4",
        subcommand: "sub2",
        argv: { com4argv: "123", sub2argv: "123" },
      },
    );

    expect(fn2).toBeCalledWith({ com4argv: "123", sub2argv: "123" });

    handler.handle(
      {
        command: "com4",
        subcommand: "sub3",
        subsubcommand: "subsub2",
        argv: {
          com4argv: "123",
          sub3argv: "123",
          subsub2argv: "123",
        },
      },
    );

    expect(fn3).toBeCalledWith({
      com4argv: "123",
      sub3argv: "123",
      subsub2argv: "123",
    });
  });

  test("nested record handler 2", () => {
  });

  test("syncness", () => {
    const handlerAsync = createHandlerFor(com1, async args => {});
    expectTypeOf(handlerAsync.handle).returns.toEqualTypeOf<Promise<void>>();
    const handlerSync = createHandlerFor(com1, args => {});
    expectTypeOf(handlerSync.handle).returns.toEqualTypeOf<void>();

    const handlerSync2 = createHandlerFor(com1com2, {
      "com1": args => {},
      "com2": args => {},
    });

    expectTypeOf(handlerSync2.handle).returns.toEqualTypeOf<void>();

    const handlerAsync2 = createHandlerFor(com1com2, {
      "com1": async args => {},
      "com2": async args => {},
    });

    expectTypeOf(handlerAsync2.handle).returns.toEqualTypeOf<Promise<void>>();

    const handlerMixed2 = createHandlerFor(com1com2, {
      "com1": async args => {},
      "com2": args => {},
    });

    expectTypeOf(handlerMixed2.handle).returns.toEqualTypeOf<
      Promise<void> | void
    >();

    const handlerSync3 = createHandlerFor(sub3, () => {});
    const handlerAsync3 = createHandlerFor(sub3, async () => {});

    expectTypeOf(handlerSync3.handle).returns.toEqualTypeOf<void>();
    expectTypeOf(handlerAsync3.handle).returns.toEqualTypeOf<Promise<void>>();

    const nested1 = subs(com3, com1com2);

    const handler3 = createHandlerFor(nested1, handlerSync2);
    const handler3a = createHandlerFor(nested1, handlerAsync2);
    const handler3m = createHandlerFor(nested1, handlerMixed2);

    expectTypeOf(handler3.handle).returns.toEqualTypeOf<void>();
    expectTypeOf(handler3a.handle).returns.toEqualTypeOf<Promise<void>>();
    expectTypeOf(handler3m.handle).returns.toEqualTypeOf<
      Promise<void> | void
    >();
  });
});
