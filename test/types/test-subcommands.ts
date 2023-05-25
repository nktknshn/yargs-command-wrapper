import { expectTypeOf } from "expect-type";
import { comm, comp, subs } from "../../src";
import { opt } from "./addOption";
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
        comm("command1", "desc", opt("a")),
        [
          comm("sc1", "desc", opt("b")),
          comm("sc2", "desc", opt("c")),
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
        comm("command1", "desc", opt("a")),
        comp(
          opt("d"),
          comm("sc1", "desc", opt("b")),
          comm("sc2", "desc", opt("c")),
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
