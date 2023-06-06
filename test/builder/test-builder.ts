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

  test("test addSubcommands", () => {
    const command1 = comm("command1", "desc");
    const subcommand1 = comm("subcommand1", "desc");
    const subcommand2 = comm("subcommand2", "desc");

    expect(
      subs(
        command1,
        [subcommand1, subcommand2],
      ).subcommands,
    ).toStrictEqual(
      comp(subcommand1, subcommand2),
    );
  });

  test("subs overload 2 and 3", () => {
    const cmd1: CommandComposedWithSubcommands<
      "com1",
      readonly [typeof sub1, typeof sub2],
      EmptyRecord
    > = subs("com1", "command 1", [sub1, sub2]);

    expect(cmd1.command.commandName).toBe("com1");
    expect(cmd1.command.commandDesc).toStrictEqual(["com1"]);
    expect(cmd1.command.builder(y)).toBe(y);
    expect(cmd1.command.type).toBe("command");
    expect(cmd1.command.description).toBe("command 1");
    expect(cmd1.subcommands).toStrictEqual(comp(sub1, sub2));

    const addOptParent = opt("com1arg");
    const addOptComp = opt("s1s2compargv");

    const cmd2: CommandComposedWithSubcommands<
      "com1",
      readonly [typeof sub1, typeof sub2],
      { com1arg: string }
    > = subs(["com1", "c"], "command 1", addOptParent, [sub1, sub2]);

    expect(cmd2.command.commandName).toBe("com1");
    expect(cmd2.command.commandDesc).toStrictEqual(["com1", "c"]);
    expect(cmd2.command.builder).toBe(addOptParent);
    expect(cmd2.command.type).toBe("command");
    expect(cmd2.command.description).toBe("command 1");
    expect(cmd2.subcommands).toStrictEqual(comp(sub1, sub2));

    const s1s2comp: CommandComposed<[
      typeof sub1,
      typeof sub2,
    ], { s1s2compargv: string }> = comp(addOptComp, sub1, sub2);

    const cmd3 = subs("com1", "command 1", s1s2comp);

    expectTypeOf(cmd3).toMatchTypeOf<
      CommandComposedWithSubcommands<
        "com1",
        readonly [typeof sub1, typeof sub2],
        EmptyRecord,
        { s1s2compargv: string }
      >
    >();

    expect(cmd3.command.commandName).toBe("com1");
    expect(cmd3.command.commandDesc).toStrictEqual(["com1"]);
    expect(cmd3.command.builder(y)).toBe(y);
    expect(cmd3.command.type).toBe("command");
    expect(cmd3.command.description).toBe("command 1");
    expect(cmd3.subcommands).toStrictEqual(s1s2comp);

    const cmd4 = subs("com1", "command 1", addOptParent, s1s2comp);

    expectTypeOf(cmd4).toMatchTypeOf<
      CommandComposedWithSubcommands<
        "com1",
        readonly [typeof sub1, typeof sub2],
        { com1arg: string },
        { s1s2compargv: string }
      >
    >();

    expect(cmd3.command.commandName).toBe("com1");
    expect(cmd3.command.commandDesc).toStrictEqual(["com1"]);
    expect(cmd2.command.builder).toBe(addOptParent);
    expect(cmd3.command.type).toBe("command");
    expect(cmd3.command.description).toBe("command 1");
    expect(cmd3.subcommands).toStrictEqual(s1s2comp);
  });
});
