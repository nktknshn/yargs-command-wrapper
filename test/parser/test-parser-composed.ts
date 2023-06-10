import assert from "assert";
import yargs from "yargs";
import {
  buildAndParse,
  buildAndParseUnsafeR,
  comm,
  comp,
  Either as E,
  subs,
} from "../../src";
import { pushCommand } from "../../src/command/commands/args/push-command";

describe("parser composed command", () => {
  test("basic", () => {
    const cmd = comp(
      comm("cmd1", "desc"),
      comm("cmd2", "desc"),
    );

    expect(buildAndParseUnsafeR(cmd, "cmd1")).toStrictEqual(
      { command: "cmd1", argv: {} },
    );

    expect(buildAndParse(cmd, "nocmd").result._tag).toStrictEqual("Left");
    expect(buildAndParse(cmd, []).result._tag).toStrictEqual("Left");
  });

  test("basic self handle", () => {
    const cmd = comp(
      comm("cmd1", "desc"),
      comm("cmd2", "desc"),
    ).selfHandle(true);

    expect(buildAndParseUnsafeR(cmd, "")).toStrictEqual(
      { command: "", argv: {} },
    );

    expect(buildAndParseUnsafeR(cmd, "cmd1")).toStrictEqual(
      { command: "cmd1", argv: {} },
    );
  });

  test("basic self handle composed", () => {
    const cmd = comp(
      comp(comm("cmd1", "desc"), comm("cmd2", "desc")),
      comp(comm("cmd3", "desc"), comm("cmd4", "desc")),
    ).selfHandle(true);

    expect(buildAndParseUnsafeR(cmd, "")).toStrictEqual(
      { command: "", argv: {} },
    );

    expect(buildAndParseUnsafeR(cmd, "cmd1")).toStrictEqual(
      { command: "cmd1", argv: {} },
    );

    expect(buildAndParseUnsafeR(cmd, "cmd3")).toStrictEqual(
      { command: "cmd3", argv: {} },
    );
  });
});
