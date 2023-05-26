import { buildAndParseUnsafe, comm, comp, subs } from "../../src";
import { opt } from "../types/addOption";
import { composeHandlers, handlerFor } from "./handlerFor";

const command = comm("com1", "description", opt("a"));

const com2 = comm("com2", "description", opt("c"));
const com3 = comm("com3", "description", opt("d"));

const command2 = comp(com2, com3);

const sub1 = comm("sub1", "sub1", opt("sub1argv"));
const sub2 = comm("sub2", "sub2", opt("sub2argv"));

const com4 = comm("com4", "com4", opt("com4argv"));
const subsub1 = comm("subsub1", "subsub1", opt("subsub1argv"));
const subsub2 = comm("subsub2", "subsub2", opt("subsub2argv"));

const sub3 = subs(comm("sub3", "sub3", opt("sub3argv")), [subsub1, subsub2]);

/**
 * @description com4: sub1 sub2 sub3
 */
const command3 = subs(
  com4,
  [sub1, sub2, sub3],
);

const composedCommand = comp(command, command2, command3);

describe("handlerFor", () => {
  test("basic", () => {
    const fn = jest.fn();

    const handler = handlerFor(command, (args) => {
      fn(args);
      args.a;
    });

    handler.handle({ command: "com1", argv: { a: "123" } });

    expect(fn).toBeCalledWith({ a: "123" });
  });

  test("composed function", () => {
    const [fn1, fn2] = [jest.fn(), jest.fn()];

    const handler1 = handlerFor(command2, (args) => {
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

    const handler1 = handlerFor(command2, {
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

    const com2Handler = handlerFor(com2, (args) => {
      hcom2(args);
    });
    const com3Handler = handlerFor(com3, (args) => {
      hcom3(args);
    });

    const handler1 = handlerFor(command2, {
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

    const handler1 = handlerFor(
      comp(command, command2),
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

  test("nested function handler", () => {
    const [fn1, fn2, fn3, fn4] = [jest.fn(), jest.fn(), jest.fn(), jest.fn()];

    const handler1 = handlerFor(command3, (args) => {
      fn1(args);
      args.command;
      args.subcommand;

      if (args.subcommand === "sub3") {
        args.subsubcommand;
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

    const sub3handler = handlerFor(sub3, {
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

    const handler1 = handlerFor(command3, {
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

    const handler1 = handlerFor(command3, {
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
        args.subcommand;
      },
    });
  });

  test("nested structure handler 2", () => {
    const [fn1, fn2, fn3, fn4] = [jest.fn(), jest.fn(), jest.fn(), jest.fn()];

    const handler = handlerFor(composedCommand, {
      "com1": (args) => {},
      "com2": (args) => {},
      "com3": (args) => {
        fn1(args);
      },
      "com4": {
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
});

describe("compose handlers", () => {
  test("cocompose", () => {
    const [hfn1, hfn2, hfn3, hfn4] = [
      jest.fn(),
      jest.fn(),
      jest.fn(),
      jest.fn(),
    ];

    const handler1 = handlerFor(command, (args) => {
      console.log(args);
      console.log(args.a);

      hfn1(args);
    });

    handler1.handle({ command: "com1", argv: { a: "123" } });
    expect(hfn1).toBeCalledWith({ a: "123" });

    const handler2 = handlerFor(command2, (args) => {
      args.command;
      switch (args.command) {
        case "com2":
          hfn2(args);
          args.argv.c;
          break;
        case "com3":
          args.argv.d;
          args.command;
          hfn3(args);
          break;
      }
    });

    const handler3 = handlerFor(command3, (args) => {
      args.command;
      args.subcommand;
      hfn4(args.argv);
    });

    const handler12 = composeHandlers(handler1, handler2);

    const composedHandler = composeHandlers(
      handler12,
      handler3,
    );

    composedHandler.handle({ command: "com1", argv: { a: "123" } });

    composedHandler.handle({ command: "com2", argv: { c: "123" } });
    expect(hfn2).toBeCalledWith({
      command: "com2",
      argv: { c: "123" },
    });

    composedHandler.handle({ command: "com3", argv: { d: "123" } });
    expect(hfn3).toBeCalledWith({ command: "com3", argv: { d: "123" } });

    composedHandler.handle({
      command: "com4",
      subcommand: "sub1",
      argv: { com4argv: "123", sub1argv: "456" },
    });

    expect(hfn4).toBeCalledWith({
      com4argv: "123",
      sub1argv: "456",
    });

    const { result } = buildAndParseUnsafe(composedCommand, [
      "com1",
      "com2",
      "com3",
      "com4",
    ]);

    composedHandler.handle(result);
  });
});
