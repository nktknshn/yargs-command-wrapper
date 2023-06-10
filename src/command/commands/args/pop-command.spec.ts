import { expectTypeOf } from "expect-type";
import { popCommand, PopCommandType } from "./pop-command";
import { IntersectionToNames } from "./type-command-args-generic";

const args1 = { argv: { a: 1 }, command: "a" as const };
const args2 = {
  argv: { a: 1 },
  command: "a" as const,
  subcommand: "b" as const,
};
const args3 = {
  argv: { a: 1 },
  command: "a" as const,
  subcommand: "b" as const,
  subsubcommand: "c" as const,
};

describe("pop command", () => {
  test("function", () => {
    expect(popCommand(args1).a).toBe(1);
    expect(popCommand(args2).command).toBe("b");
    expect(popCommand(args3).subcommand).toBe("c");
  });
  test("helpers", () => {
    expectTypeOf<
      IntersectionToNames<typeof args2>
    >().toEqualTypeOf<["a", "b"]>();

    expectTypeOf<
      IntersectionToNames<{ command: "a"; subcommand: undefined }>
    >().toEqualTypeOf<["a", undefined]>();
  });
  test("types", () => {
    expectTypeOf<
      PopCommandType<typeof args1>
    >().toEqualTypeOf<{ a: number }>();

    expectTypeOf<
      PopCommandType<typeof args2>
    >().toEqualTypeOf<{ command: "b"; argv: { a: number } }>();

    expectTypeOf<
      PopCommandType<typeof args3>
    >().toEqualTypeOf<{ command: "b"; subcommand: "c"; argv: { a: number } }>();
  });
});
