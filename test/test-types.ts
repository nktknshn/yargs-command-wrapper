import { expectTypeOf } from "expect-type";
import { HandlerFunctionFor } from "../src";
import {
  Command,
  CommandBasic,
  CommandComposed,
  CommandComposedWithSubcommands,
  GetCommandParseResult,
} from "../src/command";
import { CommandArgsGeneric } from "../src/command/commands/args/type-command-args-generic";
import { NestedCommandArgs } from "../src/command/commands/args/type-nested-command-args";
import { InputHandlerFunctionFor } from "../src/handler/create-handler-for/type-input-function";
import { ComposableHandlerFor } from "../src/handler/handler-composable/composable-handler-for";
import { ComposableHandler } from "../src/handler/handler-composable/type";
import { ComposedHandlers } from "../src/handler/handler-composable/types-compose";
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

type BC2H1 = ComposableHandler<
  [BC2["commandName"]],
  CommandArgs<{ b: number }, "b">
>;

type SC1H1 = ComposableHandler<
  ["c"],
  | NestedCommandArgs<{ a: number }, "c", "a">
  | NestedCommandArgs<{ b: number }, "c", "b">
>;

describe("test types hierarchy", () => {
  test("commands", () => {
    expectTypeOf<CommandBasic>().toMatchTypeOf<Command>();
    expectTypeOf<BC1>().toMatchTypeOf<CommandBasic>();
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

    type T5a = GetCommandParseResult<BC1>;

    expectTypeOf<GetCommandParseResult<BC1>>().toMatchTypeOf<T5>();
    expectTypeOf<GetCommandParseResult<BC1>>().toMatchTypeOf<T6>();

    expectTypeOf<GetCommandParseResult<CC1>>().toMatchTypeOf<T5>();
    expectTypeOf<GetCommandParseResult<CC1>>().toMatchTypeOf<T7>();

    expectTypeOf<GetCommandParseResult<SC1>>().toMatchTypeOf<T5>();
    expectTypeOf<GetCommandParseResult<SC1>>().toMatchTypeOf<T8>();
  });

  test("handler function for", () => {
    type TCommand = HandlerFunctionFor<Command>;

    // type Z =
    //   | ((argv: { command: string; argv: EmptyRecord }) => unknown)
    //   | ((argv: { command: string; argv: EmptyRecord }) => Promise<unknown>);

    type TCommandBasic = HandlerFunctionFor<CommandBasic>;
    type TCommandBasicNever = HandlerFunctionFor<CommandBasic<never, never>>;
    type TCommandComposed = HandlerFunctionFor<CommandComposed>;
    type TCommandComposedWithSubcommands = HandlerFunctionFor<
      CommandComposedWithSubcommands
    >;

    type TBC1 = HandlerFunctionFor<BC1>;
    type TCC1 = HandlerFunctionFor<CC1>;

    expectTypeOf<TBC1>().toMatchTypeOf<TCommand>();
    expectTypeOf<TBC1>().toMatchTypeOf<TCommandBasic>();

    expectTypeOf<TCC1>().toMatchTypeOf<TCommand>();
    expectTypeOf<TCC1>().toMatchTypeOf<TCommandComposed>();
  });

  test("composable handlers", async () => {
    type TCommand = ComposableHandlerFor<Command>;
    type TCommandBasic = ComposableHandlerFor<CommandBasic>;
    type TCommandComposed = ComposableHandlerFor<CommandComposed>;
    type TCommandComposedWithSubcommands = ComposableHandlerFor<
      CommandComposedWithSubcommands
    >;

    type TSC1 = ComposableHandlerFor<SC1>;

    expectTypeOf<ComposableHandlerFor<BC1>>().toMatchTypeOf<TCommand>();

    type A = ComposableHandlerFor<BC1>;
    type Aex = ComposableHandlerFor<BC1> extends TCommand ? true : false;

    type TComposed = ComposedHandlers<[BC1, BC2]>;
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
