import { comp, createHandlerFor, subs } from "../../../src";
import { opt } from "../../types/addOption";
import { com, com1, com2, sub1, sub2 } from "../fixtures";

const s1 = subs("cmd", "cmd", opt("g"), [sub1, sub2]).selfHandle(true);

describe("self handled handlers", () => {
  test("composed", () => {
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

    handler.handle({
      command: undefined,
      argv: { g: "123" },
    });

    expect(selfFn).toBeCalledWith({ g: "123" });
  });

  test("subs", () => {
    const [fn1, fn2, selfFn] = [vi.fn(), vi.fn(), vi.fn()];

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

  test("subs in composed", () => {
    const [fn1, fn2, selfFn] = [vi.fn(), vi.fn(), vi.fn()];

    const cmd = comp(opt("f"), s1, com("cmd2"));

    const handler = createHandlerFor(cmd, {
      "cmd": {
        sub1: (args) => {},
        sub2: (args) => {},
        $self: (args) => {
          selfFn(args);
        },
      },
      "cmd2": (args) => {
      },
    });

    handler.handle({
      command: "cmd",
      subcommand: undefined,
      argv: { g: "123", f: "456" },
    });

    expect(selfFn).toBeCalledWith({ g: "123", f: "456" });
  });

  test("subs in self handled composed", () => {
    const [selfFn1, selfFn2] = [vi.fn(), vi.fn(), vi.fn()];

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
});
