import { expectTypeOf } from "expect-type";

import { command, HandlerFunctionFor, subcommands } from "../../src/";
import { Command, CommandBasic, CommandComposed } from "../../src/command/";
import { GetCommandArgs, GetComposedParseResult } from "../../src/command/";
import { CommandArgsGeneric } from "../../src/command/commands/args/type-command-args-generic";
import { PushCommand } from "../../src/command/commands/args/type-push-command";
import {
  CommandsFlattenList,
  ComposeCommandsFlatten,
} from "../../src/command/commands/composed/type-helpers";
import {
  GetSubcommandsArgs,
  GetSubcommandsParseResult,
} from "../../src/command/commands/with-subcommands/type-parse-result";
import { EmptyRecord } from "../../src/common/types";
import { InputHandlerRecordFor } from "../../src/handler/create-handler-for/type-create-handler-for";
import { HandlerFunction } from "../../src/handler/handler-function/type";

describe("mapped types", () => {
  test("flatten composed", async () => {
    type L = [
      CommandComposed<[
        CommandComposed<[
          CommandBasic<"command1", { c1: number }>,
          CommandBasic<"command2", { c2: number }>,
        ], { aa: number }>,
        CommandComposed<[
          CommandBasic<"command3", { c3: number }>,
          CommandBasic<"command4", { c4: number }>,
          CommandComposed<[
            CommandBasic<"command5", { c5: number }>,
            CommandBasic<"command6", { c6: number }>,
          ], { bb: number }>,
        ], { bb: number }>,
      ], { a: number }>,
    ];

    type LF = CommandsFlattenList<L>;

    type A = CommandComposed<L>;

    type B = ComposeCommandsFlatten<A>;
    type Commands = B extends CommandComposed<infer C, infer D> ? C : never;
    type Argv = B extends CommandComposed<infer C, infer D> ? D : never;

    expectTypeOf({} as Commands).toEqualTypeOf<
      readonly [
        CommandBasic<"command6", { c6: number }>,
        CommandBasic<"command5", { c5: number }>,
        CommandBasic<"command4", { c4: number }>,
        CommandBasic<"command3", { c3: number }>,
        CommandBasic<"command2", { c2: number }>,
        CommandBasic<"command1", { c1: number }>,
      ]
    >();

    expectTypeOf({} as Argv).toEqualTypeOf<
      { a: number; aa: number; bb: number }
    >();
  });

  test("InputRecordHandlerFor", () => {
    type B = InputHandlerRecordFor<Command>;
    type A = HandlerFunctionFor<Command>;
    type C = GetCommandArgs<Command>;
    // type D = HandlerFunction<
    //   PushCommand<Command, string, {}>
    // >;

    type E<T extends Command> = T extends CommandComposed<infer C, infer D>
      ? HandlerFunction<GetCommandArgs<CommandComposed<C>>>
      : never;

    type EE = E<Command>;

    type HH = GetComposedParseResult<CommandComposed>;
  });

  test("type subcommands parse result", () => {
    const cmd = subcommands("cmd", "desc", [
      command("sub1", "desc"),
      command("sub2", "desc"),
    ]);

    type A = GetSubcommandsArgs<typeof cmd>;

    expectTypeOf<GetSubcommandsArgs<typeof cmd>>().toEqualTypeOf<
      | CommandArgsGeneric<EmptyRecord, ["cmd", "sub1"]>
      | CommandArgsGeneric<EmptyRecord, ["cmd", "sub2"]>
    >();
  });

  test("type subcommands parse result", () => {
    const cmd = subcommands("cmd", "desc", [
      command("sub1", "desc"),
      command("sub2", "desc"),
    ]);

    type A = GetSubcommandsArgs<typeof cmd>;

    expectTypeOf<GetSubcommandsArgs<typeof cmd>>().toEqualTypeOf<
      | CommandArgsGeneric<EmptyRecord, ["cmd", "sub1"]>
      | CommandArgsGeneric<EmptyRecord, ["cmd", "sub2"]>
    >();
  });
});
