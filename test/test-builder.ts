import * as y from "yargs";
import { addSubcommands, command, composeCommands } from "../src";

describe("test builder functions", () => {
  test("test command", () => {
    const command1 = command("command1", "desc");
    expect(command1.commandName).toBe("command1");
    expect(command1.commandDesc).toStrictEqual(["command1"]);

    expect(command(["command1"], "desc").commandName).toBe(
      "command1",
    );

    const command2 = command("command2 <id>", "desc");
    expect(command2.commandName).toBe("command2");
    expect(command2.commandDesc).toStrictEqual(["command2 <id>"]);

    expect(command(["command2 <id>", "cmd2", "c"], "desc").commandName).toBe(
      "command2",
    );
  });

  test("test composeCommands", () => {
    const command1 = command("command1", "desc");
    const command2 = command("command2", "desc");

    const composed1 = composeCommands(
      command1,
      command2,
    );

    expect(composed1.commands).toStrictEqual([command1, command2]);
    expect(composed1.type).toBe("composed");
    expect(composed1.builder).toBeUndefined();

    const builder = (_: y.Argv) => _.option("opt1", { type: "string" });

    const composed2 = composeCommands(builder, command1, command2);

    expect(composed2.builder).toBe(builder);
  });

  test("test addSubcommands", () => {
    const command1 = command("command1", "desc");
    const subcommand1 = command("subcommand1", "desc");
    const subcommand2 = command("subcommand2", "desc");

    expect(
      addSubcommands(
        command1,
        [subcommand1, subcommand2],
      ).subcommands,
    ).toStrictEqual(
      composeCommands(subcommand1, subcommand2),
    );

    expect(
      addSubcommands(
        command1,
        [subcommand1, subcommand2],
      ).subcommands,
    ).toStrictEqual(
      composeCommands(subcommand1, subcommand2),
    );
  });
});
