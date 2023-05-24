import assert from "assert";
import yargs from "yargs";
import {
  addSubcommands,
  buildAndParse,
  buildAndParseUnsafe,
  buildAndParseUnsafeR,
  command,
  composeCommands,
  Either as E,
} from "../../src";
import { addCommand } from "../../src/parser";

const demandCommand = <T>(y: yargs.Argv<T>) => yargs.demandCommand(1);

describe("parser commands", () => {
  const cmd = composeCommands(
    // _ => _.demandCommand(1),
    // demandCommand,
    addSubcommands(
      command("command1", "desc"),
      [command("sc1", "desc"), command("sc2", "desc")],
    ),
    addSubcommands(
      command("command2", "desc"),
      [command("sc3", "desc"), command("sc4", "desc")],
    ),
  );

  test("parse subcommand", () => {
    const { result } = buildAndParse(cmd, ["command1", "sc1"]);

    assert(E.isRight(result));

    expect(result.right.command).toEqual("command1");
    expect(result.right.subcommand).toEqual("sc1");
  });

  test("parse fail", () => {
    // should fail ?
    const { result } = buildAndParse(cmd, ["command1"]);

    assert(E.isLeft(result));

    console.log(result);
  });
});

describe("parser commands", () => {
  test("mix options 1", () => {
    const cmd = composeCommands(
      _ => _.option("debug", { type: "boolean", default: false }),
      command("get", "get", _ => _.option("debug", { type: "boolean" })),
    );

    expect(buildAndParseUnsafeR(cmd, "--debug get").argv.debug)
      .toStrictEqual(true);

    expect(buildAndParseUnsafeR(cmd, "get").argv.debug)
      .toStrictEqual(false);

    expect(buildAndParseUnsafeR(cmd, "get --debug").argv.debug)
      .toStrictEqual(true);
  });

  test("mix options 2", () => {
    const cmd = composeCommands(
      _ => _.option("debug", { type: "boolean", default: false }),
      addSubcommands(
        command("command1", "command 1"),
        composeCommands(
          _ => _.option("debug", { type: "boolean" }),
          command("get", "get"),
          command("list", "get"),
        ),
      ),
    );
    expect(buildAndParseUnsafeR(cmd, "--debug command1 get").argv.debug)
      .toStrictEqual(true);

    expect(buildAndParseUnsafeR(cmd, "command1 --debug get").argv.debug)
      .toStrictEqual(true);

    expect(buildAndParseUnsafeR(cmd, "command1 get").argv.debug)
      .toStrictEqual(false);

    expect(buildAndParseUnsafeR(cmd, "command1 get --debug").argv.debug)
      .toStrictEqual(true);
  });
});

describe("parser helper", () => {
  test("addCommand", () => {
    let x = {
      argv: { a: 1 },
    };

    const x2 = addCommand(x, "command3");

    expect(x2).toStrictEqual({
      command: "command3",
      argv: { a: 1 },
    });

    const x3 = addCommand(x2, "command2");
    const x4 = addCommand(x3, "command1");

    expect(x4).toStrictEqual({
      command: "command1",
      subcommand: "command2",
      subsubcommand: "command3",
      argv: { a: 1 },
    });
  });
});
