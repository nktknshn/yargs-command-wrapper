import { expectTypeOf } from "expect-type";

import { Command, CommandBasic, CommandComposed } from "../../src/command/";
import {
  GetCommandParseResult,
  GetComposedParseResult,
} from "../../src/command/";
import {
  CommandsFlattenList,
  ComposeCommandsFlatten,
} from "../../src/command/commands/composed/type-helpers";
import { PushCommand } from "../../src/command/commands/with-subcommands/type-push-command";
import { HandlerFunctionFor, HandlerType } from "../../src/handler";
import { InputHandlerRecordFor } from "../../src/handler/create-handler-for/type-handler-for";
import { HandlerFunctionForComposed } from "../../src/handler/types-handler-function";

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
    type C = GetCommandParseResult<Command>;
    type D = HandlerFunctionForComposed<
      PushCommand<Command, string, {}>,
      HandlerType
    >;

    type E<T extends Command> = T extends CommandComposed<infer C, infer D>
      ? HandlerFunctionForComposed<GetCommandParseResult<CommandComposed<C>>>
      : never;

    type EE = E<Command>;

    type HH = GetComposedParseResult<CommandComposed>;
  });
});
