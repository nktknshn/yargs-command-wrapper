import { expectTypeOf } from "expect-type";
import { EmptyRecord } from "../../../common/types";
import { Extends } from "../../../common/types-util";
import { CommandArgsGeneric } from "./type-command-args-generic";
import { PushCommand } from "./type-push-command";

describe("push-command", () => {
  test("types", () => {
    type Args1 = { command: "a"; argv: { a: number } };
    type Args2 = { command: "b"; argv: { b: number } };

    expectTypeOf<
      PushCommand<{ command: "a"; argv: { a: number } }, "c", { c: number }>
    >().toEqualTypeOf<
      { command: "c"; subcommand: "a"; argv: { a: number; c: number } }
    >();

    expectTypeOf<
      PushCommand<Args1 | Args2, "c", { c: number }>
    >().toEqualTypeOf<
      | { command: "c"; subcommand: "a"; argv: { a: number; c: number } }
      | { command: "c"; subcommand: "b"; argv: { b: number; c: number } }
    >();
  });
});
