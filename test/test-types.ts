import { expectTypeOf } from "expect-type";
import { HandlerFunctionFor } from "../src";
import {
  Command,
  CommandBasic,
  CommandComposed,
  CommandComposedWithSubcommands,
  GetCommandParseResult,
} from "../src/command";
import { NestedCommandArgs } from "../src/command/commands/args/type-nested-command-args";
import { HandlerFunction } from "../src/handler";
import { InputHandlerFunctionFor } from "../src/handler/create-handler-for/type-input-function";
import { ComposableHandlerFor } from "../src/handler/handler-composable/composable-handler-for";
import { ComposableHandler } from "../src/handler/handler-composable/type";
import { DefaultHandler } from "../src/handler/handler-function/type-handler-function-for";
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
    type TCommand = GetCommandParseResult<Command>;
    type TCommandBasic = GetCommandParseResult<CommandBasic>;
    type TCommandComposed = GetCommandParseResult<CommandComposed>;
    type TCommandComposedWithSubcommands = GetCommandParseResult<
      CommandComposedWithSubcommands
    >;

    expectTypeOf<TCommandBasic>().toMatchTypeOf<TCommand>();
    expectTypeOf<TCommandComposed>().toMatchTypeOf<TCommand>();
    expectTypeOf<TCommandComposedWithSubcommands>().toMatchTypeOf<TCommand>();

    expectTypeOf<GetCommandParseResult<BC1>>().toMatchTypeOf<TCommand>();
    expectTypeOf<GetCommandParseResult<BC1>>().toMatchTypeOf<TCommandBasic>();

    expectTypeOf<GetCommandParseResult<CC1>>().toMatchTypeOf<TCommand>();
    expectTypeOf<GetCommandParseResult<CC1>>().toMatchTypeOf<
      TCommandComposed
    >();

    expectTypeOf<GetCommandParseResult<SC1>>().toMatchTypeOf<TCommand>();
    expectTypeOf<GetCommandParseResult<SC1>>().toMatchTypeOf<
      TCommandComposedWithSubcommands
    >();
  });

  test("handler function for", () => {
    type TCommand = HandlerFunctionFor<Command>;

    type TCommandBasic = HandlerFunctionFor<CommandBasic>;
    type TCommandComposed = HandlerFunctionFor<CommandComposed>;
    type TCommandComposedWithSubcommands = HandlerFunctionFor<
      CommandComposedWithSubcommands
    >;

    expectTypeOf<TCommandBasic>().toMatchTypeOf<TCommand>();
    expectTypeOf<TCommandComposed>().toMatchTypeOf<TCommand>();
    expectTypeOf<TCommandComposedWithSubcommands>().toMatchTypeOf<TCommand>();

    type TBC1 = HandlerFunctionFor<BC1>;
    type TCC1 = HandlerFunctionFor<CC1>;
    type TSC1 = HandlerFunctionFor<SC1>;

    expectTypeOf<TBC1>().toMatchTypeOf<HandlerFunction>();
    expectTypeOf<TCC1>().toMatchTypeOf<HandlerFunction>();
    expectTypeOf<TSC1>().toMatchTypeOf<HandlerFunction>();

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

    expectTypeOf<TCommandBasic>().toMatchTypeOf<TCommand>();
    expectTypeOf<TCommandComposed>().toMatchTypeOf<TCommand>();
    expectTypeOf<TCommandComposedWithSubcommands>().toMatchTypeOf<TCommand>();

    type TBC1 = ComposableHandlerFor<BC1>;
    type TCC1 = ComposableHandlerFor<CC1>;
    type TSC1 = ComposableHandlerFor<SC1>;

    type A = Extends<TSC1, ComposableHandler>;

    expectTypeOf<TBC1>().toMatchTypeOf<ComposableHandler>();
    expectTypeOf<TBC1>().toMatchTypeOf<TCommandBasic>();

    expectTypeOf<TCC1>().toMatchTypeOf<ComposableHandler>();
    expectTypeOf<TCC1>().toMatchTypeOf<TCommandComposed>();

    expectTypeOf<TSC1>().toMatchTypeOf<ComposableHandler>();
    expectTypeOf<TSC1>().toMatchTypeOf<TCommandComposedWithSubcommands>();

    expectTypeOf<TBC1>().toMatchTypeOf<TCommand>();
  });

  test("input handler functions", () => {
    type TCommand = InputHandlerFunctionFor<Command>;
    type TCommandBasic = InputHandlerFunctionFor<CommandBasic>;
    type TCommandComposed = InputHandlerFunctionFor<CommandComposed>;
    type TCommandComposedWithSubcommands = InputHandlerFunctionFor<
      CommandComposedWithSubcommands
    >;

    expectTypeOf<TCommandBasic>().toMatchTypeOf<TCommand>();
    expectTypeOf<TCommandComposed>().toMatchTypeOf<TCommand>();
    expectTypeOf<TCommandComposedWithSubcommands>().toMatchTypeOf<TCommand>();

    type B = DefaultHandler<CC1>;

    type TBC1 = InputHandlerFunctionFor<BC1>;
    type TCC1 = InputHandlerFunctionFor<CC1>;
    type TSC1 = InputHandlerFunctionFor<SC1>;

    expectTypeOf<TBC1>().toMatchTypeOf<TCommand>();
    expectTypeOf<TBC1>().toMatchTypeOf<TCommandBasic>();

    expectTypeOf<TCC1>().toMatchTypeOf<TCommand>();
    expectTypeOf<TCC1>().toMatchTypeOf<TCommandComposed>();

    expectTypeOf<TSC1>().toMatchTypeOf<TCommand>();
    expectTypeOf<TSC1>().toMatchTypeOf<TCommandComposedWithSubcommands>();

    type A = InputHandlerFunctionFor<BC1>;
  });
});
