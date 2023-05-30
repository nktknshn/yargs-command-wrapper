import { expectTypeOf } from "expect-type";

import { BasicCommand, Command, ComposedCommands } from "../../src/command/";
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
import { InputHandlerRecordFor } from "../../src/handler/create-handler-for/types-handler-for";
import { HandlerFunctionForComposed } from "../../src/handler/types-handler";

describe("mapped types", () => {
  test("flatten composed", async () => {
    type L = [
      ComposedCommands<[
        ComposedCommands<[
          BasicCommand<"command1", { c1: number }>,
          BasicCommand<"command2", { c2: number }>,
        ], { aa: number }>,
        ComposedCommands<[
          BasicCommand<"command3", { c3: number }>,
          BasicCommand<"command4", { c4: number }>,
          ComposedCommands<[
            BasicCommand<"command5", { c5: number }>,
            BasicCommand<"command6", { c6: number }>,
          ], { bb: number }>,
        ], { bb: number }>,
      ], { a: number }>,
    ];

    type LF = CommandsFlattenList<L>;

    type A = ComposedCommands<L>;

    type B = ComposeCommandsFlatten<A>;
    type Commands = B extends ComposedCommands<infer C, infer D> ? C : never;
    type Argv = B extends ComposedCommands<infer C, infer D> ? D : never;

    expectTypeOf({} as Commands).toEqualTypeOf<
      readonly [
        BasicCommand<"command6", { c6: number }>,
        BasicCommand<"command5", { c5: number }>,
        BasicCommand<"command4", { c4: number }>,
        BasicCommand<"command3", { c3: number }>,
        BasicCommand<"command2", { c2: number }>,
        BasicCommand<"command1", { c1: number }>,
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

    type E<T extends Command> = T extends ComposedCommands<infer C, infer D>
      ? HandlerFunctionForComposed<GetCommandParseResult<ComposedCommands<C>>>
      : never;

    type EE = E<Command>;

    type HH = GetComposedParseResult<ComposedCommands>;
  });
});
