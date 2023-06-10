import {
  buildAndParse,
  buildAndParseUnsafeR,
  comm,
  comp,
  subs,
} from "../../src";

describe("parser composed command", () => {
  test("basic", () => {
    const cmd = subs("cmd1", "desc", [
      comm("sub1", "desc"),
      comm("sub2", "desc"),
    ]);

    expect(buildAndParse(cmd, "cmd1").result._tag).toStrictEqual("Left");
    expect(buildAndParse(cmd, "nocmd").result._tag).toStrictEqual("Left");
    expect(buildAndParse(cmd, []).result._tag).toStrictEqual("Left");

    expect(buildAndParseUnsafeR(cmd, "cmd1 sub1")).toStrictEqual({
      command: "cmd1",
      subcommand: "sub1",
      argv: {},
    });
  });

  test("basic self handle", () => {
    const cmd = subs("cmd1", "desc", [
      comm("sub1", "desc"),
      comm("sub2", "desc"),
    ]).$.selfHandle(true);

    expect(buildAndParse(cmd, "nocmd").result._tag).toStrictEqual("Left");
    expect(buildAndParse(cmd, []).result._tag).toStrictEqual("Left");

    expect(buildAndParseUnsafeR(cmd, "cmd1")).toStrictEqual({
      command: "cmd1",
      argv: {},
    });

    expect(buildAndParseUnsafeR(cmd, "cmd1 sub1")).toStrictEqual({
      command: "cmd1",
      subcommand: "sub1",
      argv: {},
    });
  });

  test("basic self handle composed", () => {
    const cmd = subs(
      "cmd1",
      "desc",
      comp(
        comm("sub1", "desc"),
        comm("sub2", "desc"),
      ).$.selfHandle(true),
    );

    expect(buildAndParse(cmd, "nocmd").result._tag).toStrictEqual("Left");
    expect(buildAndParse(cmd, []).result._tag).toStrictEqual("Left");

    expect(buildAndParseUnsafeR(cmd, "cmd1")).toStrictEqual({
      command: "cmd1",
      subcommand: "",
      argv: {},
    });

    expect(buildAndParseUnsafeR(cmd, "cmd1 sub1")).toStrictEqual({
      command: "cmd1",
      subcommand: "sub1",
      argv: {},
    });
  });

  test("basic self handle nested", () => {
    const subsCmd = comp(
      comm("sub1", "desc"),
      comm("sub2", "desc"),
    ).$.selfHandle(true);

    const cmd1 = subs("cmd1", "desc", subsCmd).$.selfHandle(true);

    const composedCmd1 = comp(
      cmd1,
      comm("cmd2", "desc"),
    ).$.selfHandle(true);

    const nestedComposedCmd1 = subs(
      "cmd3",
      "desc",
      composedCmd1,
    ).$.selfHandle(true);

    const rootComposed = comp(
      nestedComposedCmd1,
    ).$.selfHandle(true);

    expect(buildAndParseUnsafeR(rootComposed, "")).toStrictEqual({
      command: "",
      argv: {},
    });

    expect(buildAndParseUnsafeR(rootComposed, "cmd3")).toStrictEqual({
      command: "cmd3",
      argv: {},
    });

    expect(buildAndParseUnsafeR(rootComposed, "cmd3 cmd2")).toStrictEqual({
      command: "cmd3",
      subcommand: "cmd2",
      argv: {},
    });

    expect(buildAndParseUnsafeR(rootComposed, "cmd3 cmd1")).toStrictEqual({
      command: "cmd3",
      subcommand: "cmd1",
      argv: {},
    });

    expect(buildAndParseUnsafeR(rootComposed, "cmd3 cmd1 sub1")).toStrictEqual({
      command: "cmd3",
      subcommand: "cmd1",
      subsubcommand: "sub1",
      argv: {},
    });
  });

  test("basic self handle nested with self handle composed", () => {
    const subsCmd = comp(
      comm("sub1", "desc"),
      comm("sub2", "desc"),
    ).$.selfHandle(true);

    const cmd1 = subs("cmd1", "desc", subsCmd);

    const composedCmd1 = comp(
      cmd1,
      comm("cmd2", "desc"),
    ).$.selfHandle(true);

    const nestedComposedCmd1 = subs(
      "cmd3",
      "desc",
      composedCmd1,
    );

    const rootComposed = comp(
      nestedComposedCmd1,
    ).$.selfHandle(true);

    expect(buildAndParseUnsafeR(rootComposed, "")).toStrictEqual({
      command: "",
      argv: {},
    });

    expect(buildAndParseUnsafeR(rootComposed, "cmd3")).toStrictEqual({
      command: "cmd3",
      subcommand: "",
      argv: {},
    });

    expect(buildAndParseUnsafeR(rootComposed, "cmd3 cmd1")).toStrictEqual({
      command: "cmd3",
      subcommand: "cmd1",
      subsubcommand: "",
      argv: {},
    });

    expect(buildAndParseUnsafeR(rootComposed, "cmd3 cmd1 sub1")).toStrictEqual({
      command: "cmd3",
      subcommand: "cmd1",
      subsubcommand: "sub1",
      argv: {},
    });
  });
});
