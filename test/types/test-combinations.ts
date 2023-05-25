import { expectTypeOf } from "expect-type";
import { comm, comp, subs } from "../../src";
import { opt } from "./addOption";
import { buildAndParseUnsafe } from "./mocked";

describe("builder types", () => {
  test("subcommands", () => {
    const cmd = comp(
      opt("a"),
      subs(
        comm("command1", "desc", opt("c1argv")),
        [
          comm("c1sc1", "desc", opt("c1sc1argv")),
          comm("c1sc2", "desc", opt("c1sc2argv")),
        ],
      ),
      subs(
        comm("command2", "desc", opt("c2argv")),
        [
          comm("c2sc1", "desc", opt("c2sc1argv")),
          comm("c2sc2", "desc", opt("c2sc2argv")),
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
    const cmd = comp(
      opt("a"),
      subs(
        comm("command1", "desc", opt("c1argv")),
        [
          comm("c1sc1", "desc", opt("c1sc1argv")),
          comm("c1sc2", "desc", opt("c1sc2argv")),
        ],
      ),
      subs(
        comm("command2", "desc", opt("c2argv")),
        [
          subs(
            comm("c2sc1", "desc", opt("c2sc1argv")),
            comp(
              opt("c2sc1argv2"),
              comm("c2sc1sc1", "desc", opt("c2sc1sc1argv")),
              comm("c2sc1sc2", "desc", opt("c2sc1sc2argv")),
            ),
          ),
          comm("c2sc2", "desc", opt("c2sc2argv")),
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
