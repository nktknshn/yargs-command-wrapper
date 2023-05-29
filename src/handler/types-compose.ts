import {
  BasicCommand,
  Command,
  CommandWithSubcommands,
  ComposedCommands,
  GetCommandReturnType,
  GetComposedReturnType,
} from "../types";

import { Cast, ToList, ToUnion } from "../util";
import {
  CommandArgs,
  GetFunctionSyncType,
  HandlerSyncType,
} from "./types-handler";

import { GetCommandName, GetComposedCommandsNames } from "./types-helpers";

/**
 * @description A handler that can be composed with other handlers by `composeHandlers`.
 */
export type ComposableHandler =
  | BasicHandlerComposable<string, any>
  | ComposedHandlerComposable<readonly string[], any>;

export interface BasicHandlerComposable<
  TName extends string,
  TArgv extends {},
  TType extends HandlerSyncType = HandlerSyncType,
> {
  handle(argv: TArgv): TType extends "sync" ? void : Promise<void>;
  supports: TName[];
}

export interface ComposedHandlerComposable<
  TNames extends readonly string[],
  TArgv extends CommandArgs,
  TType extends HandlerSyncType = HandlerSyncType,
> {
  handle(argv: TArgv): TType extends "sync" ? void : Promise<void>;
  supports: TNames;
}

export type GetComposableHandlerSyncType<
  T extends ComposableHandler,
> = GetFunctionSyncType<T["handle"]>;

export type ComposableHandlerFor<
  TCommand extends Command,
  TType extends HandlerSyncType = HandlerSyncType,
  TGlobalArgv extends {} = {},
> = TCommand extends BasicCommand ? BasicHandlerComposable<
    TCommand["commandName"],
    GetCommandReturnType<TCommand, TGlobalArgv>,
    TType
  >
  : TCommand extends ComposedCommands ? ComposedHandlerComposable<
      Cast<ToList<GetComposedCommandsNames<TCommand>>, readonly string[]>,
      GetComposedReturnType<TCommand, TGlobalArgv>,
      TType
    >
  : TCommand extends CommandWithSubcommands ? ComposedHandlerComposable<
      [GetCommandName<TCommand>],
      GetCommandReturnType<TCommand, TGlobalArgv>,
      TType
    >
  : never;

export type ComposeArgv<THandlers extends readonly ComposableHandler[]> =
  ToUnion<THandlers> extends infer T
    ? T extends BasicHandlerComposable<infer TName, infer TArgv> ? TArgv
    : T extends ComposedHandlerComposable<infer TNames, infer TArgv> ? TArgv
    : never
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

export type ComposeSyncTypes<THandlers extends readonly ComposableHandler[]> =
  ToUnion<THandlers> extends infer T
    ? GetComposableHandlerSyncType<Cast<T, ComposableHandler>>
    : never;
