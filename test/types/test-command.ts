import { expectTypeOf } from "expect-type";
import { command, composeCommands } from "../../src";
import { buildAndParseUnsafe } from "./mocked";

describe("builder types", () => {
  test("command", () => {
    expectTypeOf(buildAndParseUnsafe(
      command("command1", "desc", (y) => y.options({ a: { type: "string" } })),
    )).toEqualTypeOf<
      { command: "command1"; argv: { a: string | undefined } }
    >();

    expectTypeOf(buildAndParseUnsafe(
      command(
        "command1",
        "desc",
        (y) => y.options({ a: { type: "string", demandOption: true } }),
      ),
    )).toEqualTypeOf<{ command: "command1"; argv: { a: string } }>();

    expectTypeOf(buildAndParseUnsafe(
      command(
        "command1",
        "desc",
        (y) => y.options({ a: { type: "string", demandOption: true } }),
      ),
    )).toEqualTypeOf<{ command: "command1"; argv: { a: string } }>();

    expectTypeOf(buildAndParseUnsafe(
      command("command1", "desc"),
    )).toEqualTypeOf<{ command: "command1"; argv: {} }>();

    expectTypeOf(buildAndParseUnsafe(
      command(
        ["command1 <id>", "c"],
        "desc",
        _ => _.positional("id", { type: "string" }),
      ),
    )).toEqualTypeOf<
      { command: "command1"; argv: { id: string | undefined } }
    >();

    expectTypeOf(buildAndParseUnsafe(
      command(
        ["command1 [id]", "c"],
        "desc",
        _ => _.positional("id", { type: "string", demandOption: true }),
      ),
    )).toEqualTypeOf<{ command: "command1"; argv: { id: string } }>();
  });
});
