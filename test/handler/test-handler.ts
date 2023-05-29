import assert from "assert";
import { expectTypeOf } from "expect-type";
import { handler } from "../../examples/complex/client";
import { buildAndParse, comm, Either as E, subsHandlers } from "../../src";
import { createHandlerFor } from "../../src/handler";
import { popCommand } from "../../src/handler/helpers";
import { opt } from "../types/addOption";

describe("handler", () => {
  test("handler helper", () => {
    expect(popCommand({ command: "a", subcommand: "b", argv: { a: 1 } }))
      .toStrictEqual({ command: "b", argv: { a: 1 } });

    expect(
      popCommand({
        command: "a",
        subcommand: "b",
        subsubcommand: "c",
        argv: { a: 1 },
      }),
    )
      .toStrictEqual({ command: "b", subcommand: "c", argv: { a: 1 } });
  });

  test("parse basic command", () => {
    const command = comm("command1", "desc", opt("a"));

    const { result } = buildAndParse(command, ["command1", "-a", "123"]);

    assert.strict(E.isRight(result));

    // const handler1 = handlerFor(command, (args) => {
    // });

    const fn = jest.fn();

    const handler2 = createHandlerFor(command, (args) => {
      fn(args);
    });

    handler2.handle(result.right);

    expect(fn).toBeCalledWith({ a: "123" });
  });

  test("test basic sub", () => {
    const [statusfn, startfn, stopfn] = [jest.fn(), jest.fn(), jest.fn()];

    const handler = subsHandlers({
      "status": (args: { items: string[] }) => statusfn(args),
      "start": (args: { address: string }) => startfn(args),
      "stop": (args: { grateful: boolean }) => stopfn(args),
    });

    handler({ "command": "status", argv: { items: ["a", "b"] } });
    handler({ "command": "start", argv: { address: "localhost" } });
    handler({ "command": "stop", argv: { grateful: true } });

    expect(statusfn.mock.calls[0][0]).toStrictEqual({ items: ["a", "b"] });
    expect(startfn.mock.calls[0][0]).toStrictEqual({ address: "localhost" });
    expect(stopfn.mock.calls[0][0]).toStrictEqual({ "grateful": true });
  });

  test("test nested", () => {
    const [getfn, setfn] = [jest.fn(), jest.fn()];

    const configHandler = subsHandlers({
      "get": (args: { key: string }) => getfn(args),
      "set": (args: { key: string }) => setfn(args),
    });

    const [statusfn, startfn, stopfn] = [jest.fn(), jest.fn(), jest.fn()];

    const serverHandler = subsHandlers({
      "status": (args: { items: string[] }) => statusfn(args),
      "start": (args: { address: string }) => startfn(args),
      "stop": (args: { grateful: boolean }) => stopfn(args),
    });

    const [listfn, uploadfn, downloadfn] = [jest.fn(), jest.fn(), jest.fn()];

    const handlerClient = subsHandlers({
      "list": (args: { path: string }) => listfn(args),
      "upload": (args: { items: string[] }) => uploadfn(args),
      "download": (args: { files: string[] }) => downloadfn(args),
      "config": configHandler,
    });

    const handler = subsHandlers({
      "server": serverHandler,
      "client": handlerClient,
    });

    handler({
      command: "server",
      subcommand: "status",
      argv: { items: ["a", "b"] },
    });

    expect(statusfn.mock.calls[0][0]).toStrictEqual({ items: ["a", "b"] });

    handler({
      command: "client",
      subcommand: "config",
      subsubcommand: "get",
      argv: { key: "a" },
    });

    expect(getfn.mock.calls[0][0]).toStrictEqual({ key: "a" });
  });
});
