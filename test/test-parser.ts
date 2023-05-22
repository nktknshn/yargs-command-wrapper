import assert from "assert";
import yargs from "yargs";
import {
  addSubcommands,
  buildAndParse,
  command,
  composeCommands,
  Either as E,
  parse,
} from "../src";

const demandCommand = <T>(y: yargs.Argv<T>) => yargs.demandCommand(1);

describe("parser", () => {
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
    const result = buildAndParse(cmd, ["command1"]);

    // assert(E.isLeft(result));

    console.log(result);
  });
});
