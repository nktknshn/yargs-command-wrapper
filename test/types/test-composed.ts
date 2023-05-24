import { expectTypeOf } from "expect-type";
import { comm, comp } from "../../src";
import { buildAndParseUnsafe } from "./mocked";

describe("builder types", () => {
  test("composeCommands", () => {
    expectTypeOf(buildAndParseUnsafe(
      comp(
        comm("command1", "desc"),
        comm("command2", "desc"),
      ),
    )).toEqualTypeOf<
      | { command: "command1"; argv: {} }
      | { command: "command2"; argv: {} }
    >();

    // test composed command options
    expectTypeOf(buildAndParseUnsafe(
      comp(
        _ => _.options({ a: { type: "string", demandOption: true } }),
        comm("command1", "desc"),
        comm("command2", "desc"),
      ),
    )).toEqualTypeOf<
      | { command: "command1"; argv: { a: string } }
      | { command: "command2"; argv: { a: string } }
    >();

    // test conflicting options
    expectTypeOf(buildAndParseUnsafe(
      comp(
        _ => _.options({ a: { type: "string", demandOption: true } }),
        comm("command1", "desc", _ => _.options({ a: { type: "number" } })),
        comm("command2", "desc"),
      ),
    )).toEqualTypeOf<
      | { command: "command1"; argv: { a: never } }
      | { command: "command2"; argv: { a: string } }
    >();

    // test conflicting options
    expectTypeOf(buildAndParseUnsafe(
      comp(
        _ => _.options({ a: { type: "string", demandOption: true } }),
        comm("command1", "desc", _ => _.options({ b: { type: "number" } })),
        comm("command2", "desc", _ => _.options({ c: { type: "number" } })),
      ),
    )).toEqualTypeOf<
      | { command: "command1"; argv: { a: string; b: number | undefined } }
      | { command: "command2"; argv: { a: string; c: number | undefined } }
    >();
  });
});
