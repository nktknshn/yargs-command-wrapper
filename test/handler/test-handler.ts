import { expectTypeOf } from "expect-type";
import { composeHandlers } from "../../src";
import { popCommand } from "../../src/handler";

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

  test("test basic", () => {
    const [statusfn, startfn, stopfn] = [jest.fn(), jest.fn(), jest.fn()];

    const handler = composeHandlers({
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

    const configHandler = composeHandlers({
      "get": (args: { key: string }) => getfn(args),
      "set": (args: { key: string }) => setfn(args),
    });

    const [statusfn, startfn, stopfn] = [jest.fn(), jest.fn(), jest.fn()];

    const serverHandler = composeHandlers({
      "status": (args: { items: string[] }) => statusfn(args),
      "start": (args: { address: string }) => startfn(args),
      "stop": (args: { grateful: boolean }) => stopfn(args),
    });

    const [listfn, uploadfn, downloadfn] = [jest.fn(), jest.fn(), jest.fn()];

    const handlerClient = composeHandlers({
      "list": (args: { path: string }) => listfn(args),
      "upload": (args: { items: string[] }) => uploadfn(args),
      "download": (args: { files: string[] }) => downloadfn(args),
      "config": configHandler,
    });

    const handler = composeHandlers({
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
