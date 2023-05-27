import { expectTypeOf } from "expect-type";

import { HandlerFunctionFor, HandlerType } from "../../src/handler";
import { ParentHandler } from "../../src/handler/handler";
import {
  ComposeCommandsFlatten,
  InputRecordHandlerFor,
} from "../../src/handler/types";
import {
  BasicCommand,
  Command,
  ComposedCommands,
  GetCommandReturnType,
  GetComposedReturnType,
  PushCommand,
} from "../../src/types";

describe("mapped types", () => {
  test("flatten composed", async () => {
    type A = ComposedCommands<[
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
    ]>;

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
    type B = InputRecordHandlerFor<Command>;
    type A = HandlerFunctionFor<Command>;
    type C = GetCommandReturnType<Command>;
    type D = ParentHandler<PushCommand<Command, string, {}>, HandlerType>;

    type E<T extends Command> = T extends ComposedCommands<infer C, infer D>
      ? ParentHandler<GetCommandReturnType<ComposedCommands<C>>>
      : never;

    type EE = E<Command>;

    type HH = GetComposedReturnType<ComposedCommands>;
  });
});
