import { comp, composeHandlers, createHandlerFor, subs } from "../../../src";
import { opt } from "../../types/addOption";
import { sub1, sub2 } from "../fixtures";

describe("self handle with composable handler", () => {
  test("can be composed", () => {
    const [fn1, fn2, selfFn] = [vi.fn(), vi.fn(), vi.fn()];
    const cmd1 = comp(opt("cmd1argv"), sub1, sub2).selfHandle(true);

    const handlerSub1 = createHandlerFor(cmd1.$.sub1, (args) => {
      expectTypeOf(args).toEqualTypeOf<
        { cmd1argv: string; sub1argv: string }
      >();
      fn1(args);
    });

    const handlerSub2 = createHandlerFor(cmd1.$.sub2, (args) => {
      expectTypeOf(args).toEqualTypeOf<
        { cmd1argv: string; sub2argv: string }
      >();
      fn2(args);
    });

    const handlerSelf = createHandlerFor(cmd1.$.$self, (args) => {
      expectTypeOf(args).toEqualTypeOf<{ cmd1argv: string }>();
      selfFn(args);
    });

    const handler = composeHandlers(
      handlerSub1,
      handlerSub2,
      handlerSelf,
    );

    handler.handle({
      command: "sub1",
      argv: { cmd1argv: "cmd1argv", sub1argv: "sub1argv" },
    });

    expect(fn1).toBeCalledWith({
      cmd1argv: "cmd1argv",
      sub1argv: "sub1argv",
    });

    handler.handle({
      command: undefined,
      argv: { cmd1argv: "cmd1argv" },
    });

    expect(selfFn).toBeCalledWith({ cmd1argv: "cmd1argv" });
  });

  test("subs handler from composable subcommands handler", () => {
    const [fn1, fn2, selfFn] = [vi.fn(), vi.fn(), vi.fn()];

    const cmdComp1 = comp(opt("cmd1argv"), sub1, sub2).selfHandle(true);
    const s1 = subs("cmd", "cmd", opt("cmdArgv"), cmdComp1);

    const cmdComp1Handler = createHandlerFor(cmdComp1, {
      sub1: (args) => {},
      sub2: (args) => {},
      $self: (args) => {
        selfFn(args);
      },
    });

    const s1Handler = createHandlerFor(s1, cmdComp1Handler);

    s1Handler.handle({
      command: "cmd",
      subcommand: undefined,
      argv: { cmdArgv: "cmdArgv", cmd1argv: "cmd1argv" },
    });

    expect(selfFn).toBeCalledWith({ cmdArgv: "cmdArgv", cmd1argv: "cmd1argv" });
  });

  test("subs handler from a composable subs handler as a record value", () => {
    const [fn1, fn2, selfFn] = [vi.fn(), vi.fn(), vi.fn()];

    const cmdComp1 = comp(opt("cmd1argv"), sub1, sub2).selfHandle(true);
    const cmd = subs("cmd", "cmd", opt("cmdArgv"), cmdComp1);
    const root = comp(cmd);

    const cmdComp1Handler = createHandlerFor(cmdComp1, {
      sub1: (args) => {},
      sub2: (args) => {},
      $self: (args) => {
        selfFn(args);
      },
    });

    const cmdHandler = createHandlerFor(cmd, {
      sub1: (args) => {},
      sub2: (args) => {},
      $self: (args) => {
        selfFn(args);
      },
    });

    const handler = createHandlerFor(root, {
      "cmd": cmdHandler,
    });

    handler.handle({
      command: "cmd",
      subcommand: undefined,
      argv: { cmdArgv: "cmdArgv", cmd1argv: "cmd1argv" },
    });

    expect(selfFn).toBeCalledWith({ cmdArgv: "cmdArgv", cmd1argv: "cmd1argv" });

    const handler2 = createHandlerFor(root, {
      "cmd": cmdComp1Handler,
    });

    handler2.handle({
      command: "cmd",
      subcommand: undefined,
      argv: { cmdArgv: "cmdArgv", cmd1argv: "cmd1argv" },
    });

    expect(selfFn).toBeCalledWith({ cmdArgv: "cmdArgv", cmd1argv: "cmd1argv" });
  });
});
