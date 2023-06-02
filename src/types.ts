import {
  Command,
  CommandBasic,
  CommandComposed,
  CommandComposedWithSubcommands,
  GetCommandParseResult,
} from "./command";
import { InputHandlerFunctionFor } from "./handler/create-handler-for/type-input-function";
import { ComposableHandlerFor } from "./handler/handler-composable/composable-handler-for";

type T1 = ComposableHandlerFor<Command>;
type T2 = ComposableHandlerFor<CommandBasic>;

type T2Ex = T2 extends T1 ? true : false;

type T2a = ComposableHandlerFor<CommandBasic<"a", { a: number }>>;

type T2aEx = T2a extends T2 ? true : false;

type T3 = ComposableHandlerFor<CommandComposed>;
type T4 = ComposableHandlerFor<CommandComposedWithSubcommands>;

type T5 = GetCommandParseResult<Command>;
type T6 = GetCommandParseResult<CommandBasic>;
type T7 = GetCommandParseResult<CommandComposed>;
type T8 = GetCommandParseResult<CommandComposedWithSubcommands>;

type T9 = InputHandlerFunctionFor<Command>;
type T10 = InputHandlerFunctionFor<CommandBasic>;
type T11 = InputHandlerFunctionFor<CommandComposed>;
type T12 = InputHandlerFunctionFor<CommandComposedWithSubcommands>;
