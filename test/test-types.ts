import { expectTypeOf } from "expect-type";
import { HandlerFunctionFor } from "../src";
import {
  Command,
  CommandBasic,
  CommandComposed,
  CommandComposedWithSubcommands,
  GetCommandArgs,
} from "../src/command";
import { CommandArgs } from "../src/command/commands/args/type-command-args";
import { NestedCommandArgs } from "../src/command/commands/args/type-nested-command-args";
import { EmptyRecord } from "../src/common/types";
import { HandlerFunction } from "../src/handler";
import {
  InputHandlerRecordFor,
  InputHandlerRecordType,
} from "../src/handler/create-handler-for/type-create-handler-for";
import { InputHandlerFunctionFor } from "../src/handler/create-handler-for/type-input-function";
import { ComposableHandler } from "../src/handler/handler-composable/type-composable-handler";
import { ComposableHandlerFor } from "../src/handler/handler-composable/type-composable-handler-for";

type Extends<T1, T2> = T1 extends T2 ? true : false;

type BC1 = CommandBasic<"a", { a: number }>;
type BC2 = CommandBasic<"b", { b: number }>;

type CC1 = CommandComposed<[BC1, BC2]>;
type CC2 = CommandComposed<[BC1, BC2], EmptyRecord, { selfHandle: true }>;

type SC1 = CommandComposedWithSubcommands<"c", [BC1, BC2]>;

type SC2 = CommandComposedWithSubcommands<
  "c",
  [BC1, BC2],
  EmptyRecord,
  EmptyRecord,
  { selfHandle: true }
>;

type BC1H1 = ComposableHandler<
  CommandArgs<{ a: number }, "a">,
  BC1["commandName"]
>;

type BC2H1 = ComposableHandler<
  CommandArgs<{ b: number }, "b">,
  BC2["commandName"]
>;

type SC1H1 = ComposableHandler<
  | NestedCommandArgs<{ a: number }, "c", "a">
  | NestedCommandArgs<{ b: number }, "c", "b">,
  "c"
>;

describe.skip("test types hierarchy", () => {
  test("commands", () => {
    expectTypeOf<CommandBasic>().toMatchTypeOf<Command>();
    expectTypeOf<BC1>().toMatchTypeOf<CommandBasic>();
    expectTypeOf<BC1>().toMatchTypeOf<Command>();

    expectTypeOf<CommandComposed>().toMatchTypeOf<Command>();
    expectTypeOf<CC1>().toMatchTypeOf<Command>();

    expectTypeOf<CommandComposedWithSubcommands>().toMatchTypeOf<Command>();
    expectTypeOf<SC1>().toMatchTypeOf<Command>();
    expectTypeOf<SC2>().toMatchTypeOf<Command>();
  });

  test("parse result", () => {
    type TCommand = GetCommandArgs<Command>;
    type TCommandBasic = GetCommandArgs<CommandBasic>;
    type TCommandComposed = GetCommandArgs<CommandComposed>;
    type TCommandComposedWithSubcommands = GetCommandArgs<
      CommandComposedWithSubcommands
    >;

    type TBC1 = GetCommandArgs<BC1>;
    type TBC2 = GetCommandArgs<BC2>;
    type TCC1 = GetCommandArgs<CC1>;
    type TSC1 = GetCommandArgs<SC1>;
    type TSC2 = GetCommandArgs<SC2>;

    expectTypeOf<TCommandBasic>().toMatchTypeOf<TCommand>();
    expectTypeOf<TCommandComposed>().toMatchTypeOf<TCommand>();
    expectTypeOf<TCommandComposedWithSubcommands>().toMatchTypeOf<TCommand>();

    expectTypeOf<GetCommandArgs<BC1>>().toMatchTypeOf<TCommand>();
    expectTypeOf<GetCommandArgs<BC1>>().toMatchTypeOf<TCommandBasic>();

    expectTypeOf<GetCommandArgs<CC1>>().toMatchTypeOf<TCommand>();
    expectTypeOf<GetCommandArgs<CC1>>().toMatchTypeOf<
      TCommandComposed
    >();

    expectTypeOf<GetCommandArgs<SC1>>().toMatchTypeOf<TCommand>();
    expectTypeOf<GetCommandArgs<SC1>>().toMatchTypeOf<
      TCommandComposedWithSubcommands
    >();
  });

  test("handler function for", () => {
    type HF = HandlerFunction;
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
    type _TBC1 = HandlerFunction<GetCommandArgs<BC1>>;
    type TCC1 = HandlerFunctionFor<CC1>;
    type TSC1 = HandlerFunctionFor<SC1>;
    type TSC2 = HandlerFunctionFor<SC2>;

    expectTypeOf<TSC2>().toEqualTypeOf<
      | ((
        args:
          | NestedCommandArgs<{ a: number }, "c", "a">
          | NestedCommandArgs<{ b: number }, "c", "b">
          | NestedCommandArgs<EmptyRecord, "c", undefined>,
      ) => Promise<unknown>)
      | ((
        args:
          | NestedCommandArgs<{ a: number }, "c", "a">
          | NestedCommandArgs<{ b: number }, "c", "b">
          | NestedCommandArgs<EmptyRecord, "c", undefined>,
      ) => unknown)
    >();

    // expectTypeOf<TBC1>().toMatchTypeOf<HandlerFunction>();
    // expectTypeOf<TCC1>().toMatchTypeOf<HandlerFunction>();
    // expectTypeOf<TSC1>().toMatchTypeOf<HandlerFunction>();

    // expectTypeOf<TBC1>().toMatchTypeOf<TCommand>();
    // expectTypeOf<TBC1>().toMatchTypeOf<TCommandBasic>();

    // expectTypeOf<TCC1>().toMatchTypeOf<TCommand>();
    // expectTypeOf<TCC1>().toMatchTypeOf<TCommandComposed>();
  });

  test("composable handlers", async () => {
    type TCommand = ComposableHandlerFor<Command>;
    type TCommandBasic = ComposableHandlerFor<CommandBasic>;
    type TCommandComposed = ComposableHandlerFor<CommandComposed>;
    type TCommandComposedWithSubcommands = ComposableHandlerFor<
      CommandComposedWithSubcommands
    >;

    type TCH = TCommand["handle"];

    expectTypeOf<TCommandBasic>().toMatchTypeOf<ComposableHandler>();
    expectTypeOf<TCommandComposed>().toMatchTypeOf<ComposableHandler>();
    expectTypeOf<TCommandComposedWithSubcommands>().toMatchTypeOf<
      ComposableHandler
    >();

    expectTypeOf<TCommandBasic>().toMatchTypeOf<TCommand>();
    expectTypeOf<TCommandComposed>().toMatchTypeOf<TCommand>();
    expectTypeOf<TCommandComposedWithSubcommands>().toMatchTypeOf<TCommand>();

    type TBC1 = ComposableHandlerFor<BC1>;
    type TCC1 = ComposableHandlerFor<CC1>;
    type TCC2 = ComposableHandlerFor<CC2>;

    type TSC1 = ComposableHandlerFor<SC1>;
    type TSC2 = ComposableHandlerFor<SC2>;

    type A = Extends<TSC1, ComposableHandler>;

    // expectTypeOf<TBC1>().toMatchTypeOf<ComposableHandler>();
    // expectTypeOf<TBC1>().toMatchTypeOf<TCommandBasic>();

    // expectTypeOf<TCC1>().toMatchTypeOf<ComposableHandler>();
    // expectTypeOf<TCC1>().toMatchTypeOf<TCommandComposed>();

    // expectTypeOf<TSC1>().toMatchTypeOf<ComposableHandler>();
    // expectTypeOf<TSC1>().toMatchTypeOf<TCommandComposedWithSubcommands>();

    // expectTypeOf<TBC1>().toMatchTypeOf<TCommand>();
  });

  test("input handler functions", () => {
    type TCommand = InputHandlerFunctionFor<Command>;
    type TCommandBasic = InputHandlerFunctionFor<CommandBasic>;
    type TCommandComposed = InputHandlerFunctionFor<CommandComposed>;
    type TCommandComposedWithSubcommands = InputHandlerFunctionFor<
      CommandComposedWithSubcommands
    >;

    type TCommandBasicString = InputHandlerFunctionFor<
      CommandBasic<string, EmptyRecord>
    >;

    expectTypeOf<TCommandBasic>().toMatchTypeOf<TCommand>();
    expectTypeOf<TCommandComposed>().toMatchTypeOf<TCommand>();
    expectTypeOf<TCommandComposedWithSubcommands>().toMatchTypeOf<TCommand>();

    type TBC1 = InputHandlerFunctionFor<BC1>;
    type TCC1 = InputHandlerFunctionFor<CC1>;
    type TSC1 = InputHandlerFunctionFor<SC1>;
    type TSC2 = InputHandlerFunctionFor<SC2>;

    // expectTypeOf<TBC1>().toMatchTypeOf<TCommand>();
    // expectTypeOf<TBC1>().toMatchTypeOf<TCommandBasic>();

    // expectTypeOf<TCC1>().toMatchTypeOf<TCommand>();
    // expectTypeOf<TCC1>().toMatchTypeOf<TCommandComposed>();

    // expectTypeOf<TSC1>().toMatchTypeOf<TCommand>();
    // expectTypeOf<TSC1>().toMatchTypeOf<TCommandComposedWithSubcommands>();

    type A = InputHandlerFunctionFor<BC1>;
  });

  test("InputHandlerRecordFor", () => {
    type IRH = InputHandlerRecordType;
    type IRHNever = InputHandlerRecordType<never>;
    type TCommand = InputHandlerRecordFor<Command>;
    type TCommandBasic = InputHandlerRecordFor<CommandBasic>;
    type TCommandComposed = InputHandlerRecordFor<CommandComposed>;
    type TCommandComposedWithSubcommands = InputHandlerRecordFor<
      CommandComposedWithSubcommands
    >;

    expectTypeOf<TCommandBasic>().toMatchTypeOf<never>();

    expectTypeOf<TCommandComposed>().toMatchTypeOf<InputHandlerRecordType>();
    expectTypeOf<TCommandComposedWithSubcommands>().toMatchTypeOf<
      InputHandlerRecordType
    >();

    type TBC1 = InputHandlerRecordFor<BC1>;
    type TCC1 = InputHandlerRecordFor<CC1>;
    type TSC1 = InputHandlerRecordFor<SC1>;

    expectTypeOf<TBC1>().toMatchTypeOf<never>();

    expectTypeOf<TCC1>().toMatchTypeOf<TCommandComposed>();
    expectTypeOf<TSC1>().toMatchTypeOf<TCommandComposedWithSubcommands>();

    // expectTypeOf<TCC1>().toMatchTypeOf<InputHandlerRecordType>();
    // expectTypeOf<TSC1>().toMatchTypeOf<InputHandlerRecordType>();
  });
});
