import { expectTypeOf, Extends } from "expect-type";
import { EmptyRecord } from "../../../common/types";
import { CommandArgsGeneric } from "./type-command-args-generic";

describe("command args", () => {
  test("type", () => {
    expectTypeOf<
      CommandArgsGeneric<{ a: number }, ["a"]>
    >().toEqualTypeOf<{
      argv: { a: number };
      command: "a";
    }>();

    expectTypeOf<
      CommandArgsGeneric<{ a: number }, ["a", "b"]>
    >().toEqualTypeOf<{
      argv: { a: number };
      command: "a";
      subcommand: "b";
    }>();

    expectTypeOf<
      CommandArgsGeneric<{ a: number }, ["a", "b", "c"]>
    >().toEqualTypeOf<{
      argv: { a: number };
      command: "a";
      subcommand: "b";
      subsubcommand: "c";
    }>();
  });

  test("test 2", () => {
    type Base = CommandArgsGeneric<EmptyRecord, [string]>;

    type C1 = CommandArgsGeneric<{ a: number }, ["a"]>;

    expectTypeOf<C1>().toMatchTypeOf<Base>();
  });
});
