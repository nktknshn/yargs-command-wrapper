import { comp, createHandlerFor, subs } from "../../../src";
import { opt } from "../../types/addOption";
import { com, com1, com2, sub1, sub2 } from "../fixtures";

describe("self handled handlers", () => {
  test("composed command with self handler", () => {
    const [fn1, fn2, selfFn] = [vi.fn(), vi.fn(), vi.fn()];

    const cmd = comp(opt("g"), com1, com2).selfHandle(true);

    const handler = createHandlerFor(cmd, {
      com1: (args) => {
        fn1(args);
      },
      com2: (args) => {
        fn2(args);
      },
      $self: (args) => {
        selfFn(args);
      },
    });

    handler.handle({ command: undefined, argv: { g: "123" } });

    expect(selfFn).toBeCalledWith({ g: "123" });
  });

  test("subs command with self handler", () => {
    const [fn1, fn2, selfFn] = [vi.fn(), vi.fn(), vi.fn()];
    const s1 = subs("cmd", "cmd", opt("g"), [sub1, sub2]).selfHandle(true);

    const handler = createHandlerFor(s1, {
      sub1: (args) => {},
      sub2: (args) => {},
      $self: (args) => {
        selfFn(args);
      },
    });

    handler.handle({
      command: "cmd",
      subcommand: undefined,
      argv: { g: "123" },
    });

    expect(selfFn).toBeCalledWith({ g: "123" });
  });

  test("self handled subs having self handled composed", () => {
    const [fn1, fn2, selfFn] = [vi.fn(), vi.fn(), vi.fn()];

    const comp1 = comp(opt("f"), sub1, sub2).selfHandle(true);
    const s1 = subs("cmd", "cmd", opt("g"), comp1).selfHandle(true);

    const handler = createHandlerFor(s1, {
      sub1: (args) => {},
      sub2: (args) => {},
      $self: (args) => {
        args.f;
        args.g;
        selfFn(args);
      },
    });

    handler.handle({
      command: "cmd",
      subcommand: undefined,
      argv: { g: "123", f: "456" },
    });

    expect(selfFn).toBeCalledWith({ g: "123", f: "456" });
  });

  test("subs having self handled composed", () => {
    const [fn1, fn2, selfFn] = [vi.fn(), vi.fn(), vi.fn()];

    const comp1 = comp(opt("f"), sub1, sub2).selfHandle(true);
    const s1 = subs("cmd", "cmd", opt("g"), comp1);

    const handler = createHandlerFor(s1, {
      sub1: (args) => {},
      sub2: (args) => {},
      $self: (args) => {
        args.f;
        args.g;
        selfFn(args);
      },
    });

    handler.handle({
      command: "cmd",
      subcommand: undefined,
      argv: { g: "123", f: "456" },
    });

    expect(selfFn).toBeCalledWith({ g: "123", f: "456" });
  });

  test("self handled subs in composed", () => {
    const [fn1, fn2, selfFn] = [vi.fn(), vi.fn(), vi.fn()];

    const s1 = subs("cmd", "cmd", opt("g"), [sub1, sub2]).selfHandle(true);

    const cmd = comp(opt("f"), s1, com("cmd2"));

    const handler = createHandlerFor(cmd, {
      "cmd": {
        sub1: (args) => {},
        sub2: (args) => {},
        $self: (args) => {
          selfFn(args);
        },
      },
      "cmd2": (args) => {},
    });

    handler.handle({
      command: "cmd",
      subcommand: undefined,
      argv: { g: "123", f: "456" },
    });

    expect(selfFn).toBeCalledWith({ g: "123", f: "456" });
  });

  test("self handled subs in self handled composed", () => {
    const [selfFn1, selfFn2] = [vi.fn(), vi.fn(), vi.fn()];

    const s1 = subs("cmd", "cmd", opt("g"), [sub1, sub2]).selfHandle(true);
    const cmd = comp(opt("f"), s1, com("cmd2")).selfHandle(true);

    const handler = createHandlerFor(cmd, {
      "cmd": {
        sub1: (args) => {},
        sub2: (args) => {},
        $self: (args) => {
          selfFn1(args);
        },
      },
      "cmd2": (args) => {},
      $self: (args) => {
        selfFn2(args);
      },
    });

    handler.handle({
      command: undefined,
      argv: { f: "456" },
    });

    expect(selfFn2).toBeCalledWith({ f: "456" });

    handler.handle({
      command: "cmd",
      subcommand: undefined,
      argv: { f: "456", g: "123" },
    });

    expect(selfFn1).toBeCalledWith({ f: "456", g: "123" });
  });

  test("self handled subs deep nested", () => {
    const [sub1fn, cmd1selfFn, cmd3selfFn, rootSelfFn, fn5] = [
      vi.fn(),
      vi.fn(),
      vi.fn(),
      vi.fn(),
      vi.fn(),
    ];

    const subsCmd = comp(opt("subsArgv"), sub1, sub2).selfHandle(true);

    const cmd1 = subs("cmd1", "desc", opt("cmd1Argv"), subsCmd).selfHandle(
      true,
    );

    const composedCmd1 = comp(opt("composedArgv"), cmd1, com2).selfHandle(true);

    const cmd3 = subs(
      "cmd3",
      "desc",
      opt("nestedArgv"),
      composedCmd1,
    ).selfHandle(true);

    const rootComposed = comp(opt("rootArgv"), cmd3).selfHandle(true);

    const handler = createHandlerFor(rootComposed, {
      "cmd3": {
        "cmd1": {
          "sub1": args => {
            expectTypeOf(args).toEqualTypeOf<{
              rootArgv: string;
              nestedArgv: string;
              composedArgv: string;
              cmd1Argv: string;
              subsArgv: string;
              sub1argv: string;
            }>();
            sub1fn(args);
          },
          "sub2": args => {
            expectTypeOf(args).toEqualTypeOf<{
              rootArgv: string;
              nestedArgv: string;
              composedArgv: string;
              cmd1Argv: string;
              subsArgv: string;
              sub2argv: string;
            }>();
          },
          "$self": args => {
            expectTypeOf(args).toEqualTypeOf<{
              rootArgv: string;
              nestedArgv: string;
              composedArgv: string;
              cmd1Argv: string;
              subsArgv: string;
            }>();
            cmd1selfFn(args);
          },
        },
        "com2": args => {
          expectTypeOf(args).toEqualTypeOf<{
            rootArgv: string;
            nestedArgv: string;
            composedArgv: string;
            c: string;
          }>();
        },
        "$self": args => {
          expectTypeOf(args).toEqualTypeOf<{
            rootArgv: string;
            nestedArgv: string;
            composedArgv: string;
          }>();
          cmd3selfFn(args);
        },
      },
      "$self": args => {
        expectTypeOf(args).toEqualTypeOf<{
          rootArgv: string;
        }>();
        rootSelfFn(args);
      },
    });

    handler.handle({
      command: undefined,
      argv: { rootArgv: "rootArgv" },
    });

    expect(rootSelfFn).toBeCalledWith({ rootArgv: "rootArgv" });

    handler.handle({
      command: "cmd3",
      subcommand: undefined,
      argv: {
        rootArgv: "rootArgv",
        nestedArgv: "nestedArgv",
        composedArgv: "composedArgv",
      },
    });

    expect(cmd3selfFn).toBeCalledWith({
      rootArgv: "rootArgv",
      nestedArgv: "nestedArgv",
      composedArgv: "composedArgv",
    });

    handler.handle({
      command: "cmd3",
      subcommand: "cmd1",
      subsubcommand: undefined,
      argv: {
        rootArgv: "rootArgv",
        nestedArgv: "nestedArgv",
        composedArgv: "composedArgv",
        cmd1Argv: "cmd1Argv",
        subsArgv: "subsArgv",
      },
    });

    expect(cmd1selfFn).toBeCalledWith({
      rootArgv: "rootArgv",
      nestedArgv: "nestedArgv",
      composedArgv: "composedArgv",
      cmd1Argv: "cmd1Argv",
      subsArgv: "subsArgv",
    });
  });
});
