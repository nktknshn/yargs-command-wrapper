import { expectTypeOf } from "expect-type";
import { addSubcommands, command, composeCommands } from "../../src";
import { addOption } from "./addOption";
import { buildAndParseUnsafe } from "./mocked";

describe("builder types", () => {
  test("subcommands", () => {
    const cmd = composeCommands(
      addOption("a"),
      addSubcommands(
        command("command1", "desc", addOption("c1argv")),
        [
          command("c1sc1", "desc", addOption("c1sc1argv")),
          command("c1sc2", "desc", addOption("c1sc2argv")),
        ],
      ),
      addSubcommands(
        command("command2", "desc", addOption("c2argv")),
        [
          command("c2sc1", "desc", addOption("c2sc1argv")),
          command("c2sc2", "desc", addOption("c2sc2argv")),
        ],
      ),
    );

    expectTypeOf(buildAndParseUnsafe(cmd)).toEqualTypeOf<
      | {
        command: "command1";
        subcommand: "c1sc1";
        argv: { a: string; c1argv: string; c1sc1argv: string };
      }
      | {
        command: "command1";
        argv: { a: string; c1argv: string; c1sc2argv: string };
        subcommand: "c1sc2";
      }
      | {
        command: "command2";
        argv: { a: string; c2argv: string; c2sc1argv: string };
        subcommand: "c2sc1";
      }
      | {
        command: "command2";
        argv: { a: string; c2argv: string; c2sc2argv: string };
        subcommand: "c2sc2";
      }
    >();
  });

  test("subcommands different levels of nest", () => {
    const cmd = composeCommands(
      addOption("a"),
      addSubcommands(
        command("command1", "desc", addOption("c1argv")),
        [
          command("c1sc1", "desc", addOption("c1sc1argv")),
          command("c1sc2", "desc", addOption("c1sc2argv")),
        ],
      ),
      addSubcommands(
        command("command2", "desc", addOption("c2argv")),
        [
          addSubcommands(
            command("c2sc1", "desc", addOption("c2sc1argv")),
            composeCommands(
              addOption("c2sc1argv2"),
              command("c2sc1sc1", "desc", addOption("c2sc1sc1argv")),
              command("c2sc1sc2", "desc", addOption("c2sc1sc2argv")),
            ),
          ),
          command("c2sc2", "desc", addOption("c2sc2argv")),
        ],
      ),
    );

    expectTypeOf(buildAndParseUnsafe(cmd)).toEqualTypeOf<
      | {
        command: "command2";
        subcommand: "c2sc1";
        subsubcommand: "c2sc1sc1";
        argv: {
          a: string;
          c2argv: string;
          c2sc1argv: string;
          c2sc1argv2: string;
          c2sc1sc1argv: string;
        };
      }
      | {
        command: "command2";
        subcommand: "c2sc1";
        subsubcommand: "c2sc1sc2";
        argv: {
          a: string;
          c2argv: string;
          c2sc1argv: string;
          c2sc1sc2argv: string;
          c2sc1argv2: string;
        };
      }
      | {
        command: "command2";
        subcommand: "c2sc2";
        argv: { a: string; c2argv: string; c2sc2argv: string };
      }
      | {
        command: "command1";
        subcommand: "c1sc1";
        argv: { a: string; c1argv: string; c1sc1argv: string };
      }
      | {
        command: "command1";
        argv: { a: string; c1argv: string; c1sc2argv: string };
        subcommand: "c1sc2";
      }
    >();
  });
});
