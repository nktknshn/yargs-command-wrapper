import { expectTypeOf } from "expect-type";
import { subs } from "../../../src";
import { createHandlerFor } from "../../../src/handler/create-handler-for/create-handler-for";
import {
  com,
  com1,
  com2,
  composedCommand,
  deepNested,
  s1s2comp,
  subsCommand,
} from "../fixtures";

describe("createHandlerFor", () => {
  test("subs from a function", () => {
    const [fn1, fn2] = [jest.fn(), jest.fn()];

    const handler = createHandlerFor(subsCommand, (args) => {
      expectTypeOf(args.command).toEqualTypeOf<"subsub1" | "subsub2">();
      fn1(args);
    });

    handler.handle({
      command: "sub3",
      subcommand: "subsub1",
      argv: { sub3argv: "sub3argv", subsub1argv: "subsub1argv" },
    });

    expect(fn1).toBeCalledWith({
      command: "subsub1",
      argv: { sub3argv: "sub3argv", subsub1argv: "subsub1argv" },
    });
  });

  test("subs from a composable handler", () => {
    const [fn1, fn2] = [jest.fn(), jest.fn()];

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

  test("subs from a record", () => {
    const [fn1, fn2] = [jest.fn(), jest.fn()];

    const handler = createHandlerFor(subsCommand, {
      "subsub1": (args) => {
        args.sub3argv;
        args.subsub1argv;
        fn1(args);
      },
      "subsub2": (args) => {
        args.sub3argv;
        args.subsub2argv;
      },
    });

    handler.handle({
      command: "sub3",
      subcommand: "subsub1",
      argv: { sub3argv: "sub3argv", subsub1argv: "subsub1argv" },
    });

    expect(fn1).toBeCalledWith({
      sub3argv: "sub3argv",
      subsub1argv: "subsub1argv",
    });
  });

  test("subs from a record nested", () => {
    const [fn1, fn2] = [jest.fn(), jest.fn()];

    const cmd = subs(com("sub1"), [subsCommand, com1, com2]);

    const args = {
      command: "sub1" as const,
      subcommand: "sub3" as const,
      subsubcommand: "subsub1" as const,
      argv: { sub3argv: "sub3argv", subsub1argv: "subsub1argv" },
    };

    createHandlerFor(cmd, {
      "sub3": (args) => {
        expectTypeOf(args.command).toEqualTypeOf<"subsub1" | "subsub2">();
        fn1(args);
      },
      "com1": (args) => {},
      "com2": (args) => {},
    }).handle(args);

    expect(fn1).toBeCalledWith({
      command: "subsub1",
      argv: { sub3argv: "sub3argv", subsub1argv: "subsub1argv" },
    });

    // part 2
    createHandlerFor(cmd, {
      "sub3": {
        "subsub1": (args) => {
          args.sub3argv;
          args.subsub1argv;
          fn2(args);
        },
        "subsub2": (args) => {},
      },
      "com1": (args) => {},
      "com2": (args) => {},
    }).handle(args);

    expect(fn2).toBeCalledWith({
      sub3argv: "sub3argv",
      subsub1argv: "subsub1argv",
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
    const [fn1, fn2] = [jest.fn(), jest.fn()];

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

  test("nested function handler", () => {
    const [fn1, fn2, fn3, fn4] = [jest.fn(), jest.fn(), jest.fn(), jest.fn()];

    const handler1 = createHandlerFor(deepNested, (args) => {
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
      command: "sub1",
      argv: { sub1argv: "123", com4argv: "123" },
    });
  });

  test("nested structure handler", () => {
    const [fn1, fn2, fn3, fn4] = [jest.fn(), jest.fn(), jest.fn(), jest.fn()];

    const sub3handler = createHandlerFor(subsCommand, {
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

    const handler1 = createHandlerFor(deepNested, {
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

    const handler1 = createHandlerFor(deepNested, {
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

    const command34handler = createHandlerFor(deepNested, {
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
});
