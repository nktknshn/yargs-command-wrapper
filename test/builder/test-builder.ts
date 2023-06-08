import y from "yargs";
import { comm, command, comp, subs } from "../../src";
import {
  CommandBasic,
  CommandComposed,
  CommandComposedWithSubcommands,
} from "../../src/command";
import { EmptyRecord } from "../../src/common/types";
import { com1, com2, sub1, sub2 } from "../handler/fixtures";
import { opt } from "../types/addOption";

describe("test builder functions", () => {
  test("test command", () => {
    const command1 = comm("command1", "desc");
    expect(command1.commandName).toBe("command1");
    expect(command1.commandDesc).toStrictEqual(["command1"]);

    expect(comm(["command1"], "desc").commandName).toBe(
      "command1",
    );

    const command2 = comm("command2 <id>", "desc");
    expect(command2.commandName).toBe("command2");
    expect(command2.commandDesc).toStrictEqual(["command2 <id>"]);

    expect(comm(["command2 <id>", "cmd2", "c"], "desc").commandName).toBe(
      "command2",
    );

    const command3 = comm(
      "command1",
      "desc",
      _ => _.option("com1arg", { type: "string" }),
    );

    expectTypeOf(command3).toEqualTypeOf<
      CommandBasic<"command1", { com1arg: string }>
    >();
  });

  test("test composeCommands", () => {
    const command1 = comm("command1", "desc");
    const command2 = comm("command2", "desc");

    const composed1 = comp(
      command1,
      command2,
    );

    expect(composed1.commands).toStrictEqual([command1, command2]);
    expect(composed1.type).toBe("composed");
    expect(composed1.builder).toBeUndefined();

    const builder = (_: y.Argv) => _.option("opt1", { type: "string" });

    const composed2 = comp(builder, command1, command2);

    expect(composed2.builder).toBe(builder);
  });
});
