import { Cast, FallbackType, ToList, ToUnion } from "../../common/types-util";

import { ComposableHandler } from "./type-composable-handler";
import {
  GetComposableHandlerArgv,
  GetComposableHandlerNames,
  GetComposableHandlerReturnType,
  GetComposableHandlerSyncType,
} from "./type-helpers";

/**
 * @description Composes handlers
 */
export type ComposedHandlers<THandlers extends readonly ComposableHandler[]> =
  ComposableHandler<
    ComposeArgv<THandlers>,
    FallbackType<ComposeNames<THandlers>, [], readonly string[]>,
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

export type ComposeNames<THandlers extends readonly ComposableHandler[]> = Cast<
  ToList<
    ToUnion<THandlers> extends infer T
      ? ToUnion<GetComposableHandlerNames<Cast<T, ComposableHandler>>>
      : never
  >,
  readonly string[]
>;

export type ComposeSyncTypes<THandlers extends readonly ComposableHandler[]> =
  ToUnion<THandlers> extends infer T
    ? GetComposableHandlerSyncType<Cast<T, ComposableHandler>>
    : never;
