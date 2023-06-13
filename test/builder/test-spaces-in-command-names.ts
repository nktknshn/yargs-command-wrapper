import { buildAndParseUnsafeR, comm, subs } from "../../src";

describe("builder trims leading spaces", () => {
  test("basic command", () => {
    const cmd1 = comm("   a ", "cmd", _ => _);
    expectTypeOf(cmd1.commandName).toEqualTypeOf<"a">();
    expect(cmd1.commandName).toBe("a");
  });

  test("subs command", () => {
    const cmd1 = subs("   a ", "cmd", [
      comm("b", "cmd", _ => _),
    ]);

    expectTypeOf(cmd1.command.commandName).toEqualTypeOf<"a">();
    expect(cmd1.command.commandName).toBe("a");
  });
});
