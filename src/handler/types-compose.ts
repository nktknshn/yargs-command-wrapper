import {
  BasicCommand,
  Command,
  CommandWithSubcommands,
  ComposedCommands,
} from "../command/";
import { GetCommandParseResult, GetComposedParseResult } from "../command/";

import { Cast, ToList, ToUnion } from "../common/types-util";
import {
  CommandArgs,
  GetFunctionReturnType,
  GetFunctionSyncType,
  HandlerSyncType,
} from "./types-handler";

import {
  GetCommandName,
  GetComposedCommandsNames,
} from "../command/commands/composed/type-helpers";

/**
 * @description A handler that can be composed with other handlers by `composeHandlers`.
 */
export type ComposableHandler =
  | BasicHandlerComposable<string, any>
  | ComposedHandlerComposable<readonly string[], any, HandlerSyncType, any>;

/**
 * @description
 */
export interface BasicHandlerComposable<
  TName extends string,
  TArgv extends {},
  TType extends HandlerSyncType = HandlerSyncType,
  TReturn = unknown,
> {
  handle(argv: TArgv): TType extends "sync" ? TReturn : Promise<TReturn>;
  supports: TName[];
}

/**
 * @description
 */
export interface ComposedHandlerComposable<
  TNames extends readonly string[],
  TArgv extends CommandArgs,
  TType extends HandlerSyncType = HandlerSyncType,
  TReturn = unknown,
> {
  handle(argv: TArgv): TType extends "sync" ? TReturn : Promise<TReturn>;
  supports: TNames;
}

export type GetComposableHandlerSyncType<
  T extends ComposableHandler,
> = GetFunctionSyncType<T["handle"]>;

export type GetComposableHandlerReturnType<
  T extends ComposableHandler,
> = GetFunctionReturnType<T["handle"]>;

/**
 * @description
 */
export type ComposableHandlerFor<
  TCommand extends Command,
  TType extends HandlerSyncType = HandlerSyncType,
  TGlobalArgv extends {} = {},
  TReturn = unknown,
> =
  //
  TCommand extends BasicCommand ? BasicHandlerComposable<
      TCommand["commandName"],
      GetCommandParseResult<TCommand, TGlobalArgv>,
      TType,
      TReturn
    >
    : TCommand extends ComposedCommands ? ComposedHandlerComposable<
        Cast<ToList<GetComposedCommandsNames<TCommand>>, readonly string[]>,
        GetComposedParseResult<TCommand, TGlobalArgv>,
        TType,
        TReturn
      >
    : TCommand extends CommandWithSubcommands ? ComposedHandlerComposable<
        [GetCommandName<TCommand>],
        GetCommandParseResult<TCommand, TGlobalArgv>,
        TType,
        TReturn
      >
    : never;

export type ComposeArgv<
  THandlers extends readonly ComposableHandler[],
> = ToUnion<THandlers> extends infer T
  ? T extends BasicHandlerComposable<infer TName, infer TArgv> ? TArgv
  : T extends ComposedHandlerComposable<infer TNames, infer TArgv> ? TArgv
  : never
  : never;

export type ComposeReturnType<
  THandlers extends readonly ComposableHandler[],
> = ToUnion<THandlers> extends infer T
  ? T extends BasicHandlerComposable<infer TName, infer TArgv, infer TReturn>
    ? GetComposableHandlerReturnType<T>
  : T extends
    ComposedHandlerComposable<infer TNames, infer TArgv, infer TReturn>
    ? GetComposableHandlerReturnType<T>
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
