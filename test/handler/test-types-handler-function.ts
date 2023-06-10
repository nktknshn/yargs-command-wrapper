import { HandlerFunctionFor } from "../../src";
import {
  CommandBasic,
  CommandComposed,
  CommandComposedWithSubcommands,
  GetCommandArgs,
} from "../../src/command";
import {
  CommandArgs,
  CommandArgsSelfHandle,
} from "../../src/command/commands/args/type-command-args";
import { CommandArgsGeneric } from "../../src/command/commands/args/type-command-args-generic";
import { GetSubcommandsParseResult } from "../../src/command/commands/with-subcommands/type-parse-result";
import { EmptyRecord } from "../../src/common/types";
import { InputHandlerFunctionFor } from "../../src/handler/create-handler-for/type-input-function";

type BC1 = CommandBasic<"sub1">;
type BC2 = CommandBasic<"sub2">;

type CC1 = CommandComposed<[BC1, BC2], EmptyRecord, { selfHandle: true }>;

type SC1 = CommandComposedWithSubcommands<"c", [BC1, BC2]>;

type SC2 = CommandComposedWithSubcommands<
  "c",
  [BC1, BC2],
  EmptyRecord,
  EmptyRecord,
  { selfHandle: true }
>;

describe("InputHandlerFunctionFor", () => {
  test("composed", () => {
    type A = InputHandlerFunctionFor<CC1>;

    expectTypeOf<A>().toEqualTypeOf<
      | ((
        args:
          | { command: undefined; argv: {} }
          | { command: "sub1"; argv: {} }
          | { command: "sub2"; argv: {} },
      ) => unknown)
      | ((
        args:
          | { command: undefined; argv: {} }
          | { command: "sub1"; argv: {} }
          | { command: "sub2"; argv: {} },
      ) => Promise<unknown>)
    >();
  });

  test("subs", () => {
    type A = InputHandlerFunctionFor<SC2>;

    expectTypeOf<A>().toEqualTypeOf<InputHandlerFunctionFor<CC1>>();
  });

  test("both subs and composed", () => {
    type C = CommandComposedWithSubcommands<
      "c",
      [BC1, BC2],
      EmptyRecord,
      EmptyRecord,
      { selfHandle: true },
      { selfHandle: true }
    >;

    type A = InputHandlerFunctionFor<C>;

    expectTypeOf<A>().toEqualTypeOf<InputHandlerFunctionFor<CC1>>();
  });

  test("subs nested with selfHandle", () => {
    type Cmd1 = CommandComposedWithSubcommands<
      "cmd1",
      [CommandBasic<"sub1">, CommandBasic<"sub2">],
      EmptyRecord,
      EmptyRecord,
      { selfHandle: true },
      { selfHandle: true }
    >;

    type Cmd3 = CommandComposedWithSubcommands<
      "cmd3",
      [CommandBasic<"cmd2">, Cmd1],
      EmptyRecord,
      EmptyRecord,
      { selfHandle: true },
      { selfHandle: true }
    >;

    type RootCmd = CommandComposed<
      [CommandBasic<"cmd0">, Cmd3],
      EmptyRecord,
      { selfHandle: true }
    >;

    type A = InputHandlerFunctionFor<RootCmd>;

    const a: A = (args) => {
      if (args.command === "cmd3") {
        expectTypeOf(args.subcommand).toEqualTypeOf<
          "cmd2" | "cmd1" | undefined
        >();
        if (args.subcommand === "cmd1") {
          expectTypeOf(args.subsubcommand).toEqualTypeOf<
            "sub1" | "sub2" | undefined
          >();
        }
      }
    };
  });
});
