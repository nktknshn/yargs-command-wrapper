import { expectTypeOf } from "expect-type";
import { HandlerFunctionFor } from "../src";
import {
  Command,
  CommandBasic,
  CommandComposed,
  CommandComposedWithSubcommands,
  GetCommandParseResult,
} from "../src/command";
import { InputHandlerFunctionFor } from "../src/handler/create-handler-for/type-input-function";
import { ComposableHandlerFor } from "../src/handler/handler-composable/composable-handler-for";
import { ComposableHandler } from "../src/handler/handler-composable/type";
import { CommandArgs } from "./test-try-handler";

type Extends<T1, T2> = T1 extends T2 ? true : false;

type BC1 = CommandBasic<"a", { a: number }>;
type BC2 = CommandBasic<"b", { b: number }>;

type CC1 = CommandComposed<[BC1, BC2]>;

type SC1 = CommandComposedWithSubcommands<"c", [BC1, BC2]>;

type BC1H1 = ComposableHandler<
  [BC1["commandName"]],
  CommandArgs<{ a: number }, "a">
>;

describe("test types hierarchy", () => {
  test("commands", () => {
    expectTypeOf<CommandBasic>().toMatchTypeOf<Command>();
    expectTypeOf<BC1>().toMatchTypeOf<Command>();

    expectTypeOf<CommandComposed>().toMatchTypeOf<Command>();
    expectTypeOf<CC1>().toMatchTypeOf<Command>();

    expectTypeOf<CommandComposedWithSubcommands>().toMatchTypeOf<Command>();
    expectTypeOf<SC1>().toMatchTypeOf<Command>();
  });

  test("parse result", () => {
    type T5 = GetCommandParseResult<Command>;
    type T6 = GetCommandParseResult<CommandBasic>;
    type T7 = GetCommandParseResult<CommandComposed>;
    type T8 = GetCommandParseResult<CommandComposedWithSubcommands>;

    expectTypeOf<GetCommandParseResult<BC1>>().toMatchTypeOf<T5>();
    expectTypeOf<GetCommandParseResult<BC1>>().toMatchTypeOf<T6>();

    expectTypeOf<GetCommandParseResult<CC1>>().toMatchTypeOf<T5>();
    expectTypeOf<GetCommandParseResult<CC1>>().toMatchTypeOf<T7>();

    expectTypeOf<GetCommandParseResult<SC1>>().toMatchTypeOf<T5>();
    expectTypeOf<GetCommandParseResult<SC1>>().toMatchTypeOf<T8>();
  });

  test("composable handlers", async () => {
    type T1 = ComposableHandlerFor<Command>;
    type T2 = ComposableHandlerFor<CommandBasic>;
    type T3 = ComposableHandlerFor<CommandComposed>;
    type T4 = ComposableHandlerFor<CommandComposedWithSubcommands>;

    expectTypeOf<ComposableHandlerFor<BC1>>().toMatchTypeOf<T1>();

    type A = ComposableHandlerFor<BC1> extends T1 ? true : false;

    expectTypeOf;
  });

  test("handler function for", () => {
    type T1 = HandlerFunctionFor<Command>;
    type T2 = HandlerFunctionFor<CommandBasic>;
    type T3 = HandlerFunctionFor<CommandComposed>;
    type T4 = HandlerFunctionFor<CommandComposedWithSubcommands>;

    expectTypeOf<HandlerFunctionFor<BC1>>().toMatchTypeOf<T1>();
    expectTypeOf<HandlerFunctionFor<BC1>>().toMatchTypeOf<T2>();

    type A = HandlerFunctionFor<BC1>;
  });

  test("input handler functions", () => {
    type T9 = InputHandlerFunctionFor<Command>;
    type T10 = InputHandlerFunctionFor<CommandBasic>;
    type T11 = InputHandlerFunctionFor<CommandComposed>;
    type T12 = InputHandlerFunctionFor<CommandComposedWithSubcommands>;

    expectTypeOf<InputHandlerFunctionFor<BC1>>().toMatchTypeOf<T9>();
    expectTypeOf<InputHandlerFunctionFor<BC1>>().toMatchTypeOf<T10>();

    type A = InputHandlerFunctionFor<BC1>;
  });
});
