import { expectTypeOf } from "expect-type";
import { addSubcommands, command, composeCommands } from "../../src";
import { addOption } from "./addOption";
import { buildAndParseUnsafe } from "./mocked";

describe("builder types", () => {
  test("subcommands", () => {
    expectTypeOf(buildAndParseUnsafe(
      addSubcommands(
        command("command1", "desc"),
        [command("sc1", "desc"), command("sc2", "desc")],
      ),
    )).toEqualTypeOf<
      | { command: "command1"; subcommand: "sc1"; argv: {} }
      | { command: "command1"; subcommand: "sc2"; argv: {} }
    >();

    expectTypeOf(buildAndParseUnsafe(
      addSubcommands(
        command("command1", "desc", addOption("a")),
        [
          command("sc1", "desc", addOption("b")),
          command("sc2", "desc", addOption("c")),
        ],
      ),
    )).toEqualTypeOf<
      | {
        command: "command1";
        subcommand: "sc1";
        argv: { a: string; b: string };
      }
      | {
        command: "command1";
        subcommand: "sc2";
        argv: { a: string; c: string };
      }
    >();

    // test mixed options from composed and parenting commands
    expectTypeOf(buildAndParseUnsafe(
      addSubcommands(
        command("command1", "desc", addOption("a")),
        composeCommands(
          addOption("d"),
          command("sc1", "desc", addOption("b")),
          command("sc2", "desc", addOption("c")),
        ),
      ),
    )).toEqualTypeOf<
      | {
        command: "command1";
        subcommand: "sc1";
        argv: { a: string; b: string; d: string };
      }
      | {
        command: "command1";
        subcommand: "sc2";
        argv: { a: string; c: string; d: string };
      }
    >();
  });
});
