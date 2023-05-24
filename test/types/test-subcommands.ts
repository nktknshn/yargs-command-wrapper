import { expectTypeOf } from "expect-type";
import { comm, comp, subs } from "../../src";
import { addOption } from "./addOption";
import { buildAndParseUnsafe } from "./mocked";

describe("builder types", () => {
  test("subcommands", () => {
    expectTypeOf(buildAndParseUnsafe(
      subs(
        comm("command1", "desc"),
        [comm("sc1", "desc"), comm("sc2", "desc")],
      ),
    )).toEqualTypeOf<
      | { command: "command1"; subcommand: "sc1"; argv: {} }
      | { command: "command1"; subcommand: "sc2"; argv: {} }
    >();

    expectTypeOf(buildAndParseUnsafe(
      subs(
        comm("command1", "desc", addOption("a")),
        [
          comm("sc1", "desc", addOption("b")),
          comm("sc2", "desc", addOption("c")),
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
      subs(
        comm("command1", "desc", addOption("a")),
        comp(
          addOption("d"),
          comm("sc1", "desc", addOption("b")),
          comm("sc2", "desc", addOption("c")),
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
