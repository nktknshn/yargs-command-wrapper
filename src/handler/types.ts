import { UnionToIntersection } from "tsafe";
import {
  BasicCommand,
  Command,
  CommandWithSubcommands,
  ComposedCommands,
  GetCommandReturnType,
  GetComposedReturnType,
  PushCommand,
} from "../types";

import { Cast, TupleKeys } from "../util";
import { ToList, ToUnion } from "../util";
import {
  BasicHandler,
  CommandArgs,
  HandlerFunction,
  HandlerType,
  ParentHandler,
} from "./handler";

interface BasicHandlerComposable<TName extends string, TArgv extends {}> {
  handle(argv: TArgv): void;
  supports: TName[];
}
export interface ComposedHandlerComposable<
  TNames extends readonly string[],
  TArgv extends CommandArgs,
> {
  handle(argv: TArgv): void;
  supports: TNames;
}

/**
 * @description Gets a union of all the composed commands names
 */
export type GetComposedCommandsNames<T extends ComposedCommands> = T extends
  ComposedCommands<infer TCommands>
  ? GetCommandName<Cast<ToUnion<TCommands>, Command>>
  : never;

export type InputRecordHandler = {
  [key: string]: HandlerFunction | InputRecordHandler | ComposableHandler;
};

/**
 * @description Gets the name of a command. For a composed command it returns `never`
 */
export type GetCommandName<TCommand extends Command> = TCommand extends
  BasicCommand<infer TName, infer TArgv> ? TName
  : TCommand extends ComposedCommands ? never
  : TCommand extends
    CommandWithSubcommands<infer TName, infer TArgv, infer TCommands> ? TName
  : never;

/**
 * @description Flattens a composed commands tree into a list of commands that are not composed
 */
export type ComposeCommandsFlatten<TCommand extends Command> = ComposedCommands<
  Cast<ToList<_ComposeCommandsFlatten<TCommand>>, readonly Command[]>,
  _ComposeCommandsFlattenArgv<TCommand>
>;

type _ComposeCommandsFlatten<TCommand extends Command> = TCommand extends
  ComposedCommands<infer TCommands, infer TArgv>
  ? ToUnion<TCommands> extends infer C
    ? C extends ComposedCommands ? _ComposeCommandsFlatten<C>
    : C
  : never
  : never;

/**
 * @description Gets composed commands common Argv
 */
type _ComposeCommandsFlattenArgv<TCommand extends Command> = TCommand extends
  ComposedCommands<infer TCommands, infer TArgv> ? 
    & TArgv
    & UnionToIntersection<
      (ToUnion<TCommands> extends infer C
        ? C extends ComposedCommands ? _ComposeCommandsFlattenArgv<C>
        : {}
        : never)
    >
  : never;

export type InputHandlerFunctionFor<
  TCommand extends Command,
  TGlobalArgv extends {} = {},
  THandlerType extends HandlerType = "sync",
> = TCommand extends BasicCommand<infer TName, infer TArgv>
  ? BasicHandler<TArgv & TGlobalArgv>
  : TCommand extends ComposedCommands<infer TCommands, infer TArgv>
    ? ParentHandler<
      GetCommandReturnType<ComposedCommands<TCommands, TArgv & TGlobalArgv>>,
      THandlerType
    >
  : TCommand extends CommandWithSubcommands<
    infer TName,
    infer TCommands,
    infer TArgv,
    infer TComposedArgv
  > ? ParentHandler<
      PushCommand<
        GetCommandReturnType<
          ComposedCommands<TCommands, TArgv & TComposedArgv>
        >,
        TName,
        TGlobalArgv
      >,
      THandlerType
    >
  : never;

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
export type ComposableHandler =
  | BasicHandlerComposable<string, any>
  | ComposedHandlerComposable<readonly string[], any>;
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

export type InputRecordHandlerFor<
  TCommand extends Command | readonly Command[],
  // `TGlobalArgv` is object to intersect with `TArgv` of `TCommand`
  TGlobalArgv extends {} = {},
> = TCommand extends ComposedCommands
  ? ComposedCommandsInputRecord<TCommand, TGlobalArgv>
  : TCommand extends CommandWithSubcommands<
    infer TName,
    infer TCommands,
    infer TArgv,
    infer TCommandArgv
  > ? ComposedCommandsInputRecord<
      ComposedCommands<TCommands, TArgv & TCommandArgv & TGlobalArgv>,
      TGlobalArgv
    >
  : never;
