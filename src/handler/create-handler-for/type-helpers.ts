import { Command } from "../../command";
import { ComposableHandler } from "../handler-composable/type-composable-handler";
import {
  GetComposableHandlerReturnType,
  GetComposableHandlerSyncType,
} from "../handler-composable/type-helpers";

import { HandlerFunction } from "../handler-function/type";
import { GetFunctionReturnType, GetFunctionSyncType } from "../type-helpers";
import {
  InputHandlerRecordFor,
  InputHandlerRecordType,
} from "./type-create-handler-for";

export type GetSyncType<
  T extends
    | HandlerFunction
    | InputHandlerRecordFor<Command>
    | ComposableHandler,
> = T extends HandlerFunction<never> ? GetFunctionSyncType<T>
  : T extends InputHandlerRecordType<never>
    ? GetInputRecordHandlerForSyncType<T>
  : T extends ComposableHandler ? GetComposableHandlerSyncType<T>
  : never;

export type GetReturnType<
  T extends
    | HandlerFunction
    | InputHandlerRecordFor<Command>
    | ComposableHandler,
> = T extends HandlerFunction<never> ? GetFunctionReturnType<T>
  : T extends InputHandlerRecordType<never>
    ? GetInputRecordHandlerForReturnType<T>
  : T extends ComposableHandler ? GetComposableHandlerReturnType<T>
  : never;

// helpers
type GetInputRecordHandlerForSyncType<
  T extends InputHandlerRecordType<never>,
> = {
  [K in keyof T]: T[K] extends HandlerFunction<never>
    ? GetFunctionSyncType<T[K]>
    : T[K] extends ComposableHandler ? GetFunctionSyncType<T[K]["handle"]>
    : T[K] extends InputHandlerRecordType<never>
      ? GetInputRecordHandlerForSyncType<T[K]>
    : never;
}[keyof T];

type GetInputRecordHandlerForReturnType<
  T extends InputHandlerRecordType<never>,
> = {
  [K in keyof T]: T[K] extends HandlerFunction<never>
    ? GetFunctionReturnType<T[K]>
    : T[K] extends ComposableHandler ? GetFunctionReturnType<T[K]["handle"]>
    : T[K] extends InputHandlerRecordType<never>
      ? GetInputRecordHandlerForReturnType<T[K]>
    : never;
}[keyof T];
