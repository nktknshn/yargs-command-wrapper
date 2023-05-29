import {
  BasicCommand,
  Command,
  CommandWithSubcommands,
  ComposedCommands,
  GetCommandReturnType,
  GetComposedReturnType,
} from "../types";

import { Cast, ToList, ToUnion, TupleKeys } from "../util";
import { HandlerType } from "./types-handler";

import {
  BasicHandlerComposable,
  ComposableHandler,
  ComposedHandlerComposable,
  InputHandlerFunctionFor,
  InputRecordHandlerFor,
} from "./types-handler-for";

import {
  ComposeCommandsFlatten,
  GetCommandName,
  GetComposedCommandsNames,
} from "./types-helpers";

export type ComposableHandlerFor<
  TCommand extends Command,
  TGlobalArgv extends {} = {},
> = TCommand extends BasicCommand ? BasicHandlerComposable<
    TCommand["commandName"],
    GetCommandReturnType<TCommand>
  >
  : TCommand extends ComposedCommands ? ComposedHandlerComposable<
      Cast<ToList<GetComposedCommandsNames<TCommand>>, readonly string[]>,
      GetComposedReturnType<TCommand>
    >
  : TCommand extends CommandWithSubcommands ? ComposedHandlerComposable<
      [GetCommandName<TCommand>],
      GetCommandReturnType<TCommand>
    >
  : never;

export type CommandWithSubcommandsHandlerFor<
  TCommand extends CommandWithSubcommands,
> = TCommand extends CommandWithSubcommands<
  infer TName,
  infer TCommands,
  infer TArgv,
  infer TCommandArgv
> ? ComposableHandlerFor<ComposedCommands<TCommands, TArgv & TCommandArgv>>
  : never;

export type ComposeNames<THandlers extends readonly ComposableHandler[]> = Cast<
  ToList<
    ToUnion<THandlers> extends infer T
      ? T extends BasicHandlerComposable<infer TName, infer TArgv> ? TName
      : T extends ComposedHandlerComposable<infer TNames, infer TArgv>
        ? ToUnion<TNames>
      : never
      : never
  >,
  readonly string[]
>;
export type ComposeArgv<THandlers extends readonly ComposableHandler[]> =
  ToUnion<THandlers> extends infer T
    ? T extends BasicHandlerComposable<infer TName, infer TArgv> ? TArgv
    : T extends ComposedHandlerComposable<infer TNames, infer TArgv> ? TArgv
    : never
    : never;

export type ComposedCommandsInputRecord<
  TCommand extends ComposedCommands,
  TGlobalArgv extends {},
> = ComposeCommandsFlatten<TCommand> extends ComposedCommands<
  infer TCommands,
  infer TArgv
> ? {
    [
      // key is the name of the command
      P in TupleKeys<TCommands> as GetCommandName<
        Cast<TCommands[P], Command>
      >
    ]:
      // the value is a function
      | InputHandlerFunctionFor<
        Cast<TCommands[P], Command>,
        TArgv & TGlobalArgv,
        HandlerType
      >
      // the value is another handler
      | ComposableHandlerFor<Cast<TCommands[P], Command>, TArgv & TGlobalArgv>
      // the value is a record
      | InputRecordHandlerFor<Cast<TCommands[P], Command>, TArgv & TGlobalArgv>;
  }
  : never;
