import { CommandName } from "../../command/commands/args/type-command-args-generic";
import { Cast, FallbackType, ToList, ToUnion } from "../../common/types-util";

import { ComposableHandler } from "./type-composable-handler";
import {
  GetComposableHandlerArgv,
  GetComposableHandlerNames,
  GetComposableHandlerReturnType,
  GetComposableHandlerSyncType,
} from "./type-helpers";

/**
 * @description Composes handlers types
 */
export type ComposedHandlers<THandlers extends readonly ComposableHandler[]> =
  ComposableHandler<
    ComposeArgv<THandlers>,
    ComposeNames<THandlers>,
    ComposeSyncTypes<THandlers>,
    ComposeReturnType<THandlers>
  >;

export type ComposeArgv<
  THandlers extends readonly ComposableHandler[],
> = ToUnion<THandlers> extends infer T
  ? GetComposableHandlerArgv<Cast<T, ComposableHandler>>
  : never;

export type ComposeReturnType<
  THandlers extends readonly ComposableHandler[],
> = ToUnion<THandlers> extends infer T
  ? GetComposableHandlerReturnType<Cast<T, ComposableHandler>>
  : never;

export type ComposeNames<THandlers extends readonly ComposableHandler[]> =
  ToUnion<THandlers> extends infer T
    ? GetComposableHandlerNames<Cast<T, ComposableHandler>>
    : never;

export type ComposeSyncTypes<THandlers extends readonly ComposableHandler[]> =
  ToUnion<THandlers> extends infer T
    ? GetComposableHandlerSyncType<Cast<T, ComposableHandler>>
    : never;
