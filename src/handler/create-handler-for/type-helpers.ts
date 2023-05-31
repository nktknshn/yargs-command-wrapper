import { Command } from "../../command";
import { ComposableHandler } from "../handler-composable/type";
import {
  GetComposableHandlerReturnType,
  GetComposableHandlerSyncType,
} from "../handler-composable/type-helpers";

import { HandlerFunction } from "../handler-function/type";
import { GetFunctionReturnType, GetFunctionSyncType } from "../type-helpers";
import {
  InputHandlerRecordFor,
  InputRecordHandler,
} from "./type-create-handler-for";

export type GetSyncType<
  T extends
    | HandlerFunction
    | InputHandlerRecordFor<Command>
    | ComposableHandler,
> = T extends HandlerFunction ? GetFunctionSyncType<T>
  : T extends InputRecordHandler ? GetInputRecordHandlerForSyncType<T>
  : T extends ComposableHandler ? GetComposableHandlerSyncType<T>
  : never;

export type GetReturnType<
  T extends
    | HandlerFunction
    | InputHandlerRecordFor<Command>
    | ComposableHandler,
> = T extends HandlerFunction ? GetFunctionReturnType<T>
  : T extends InputRecordHandler ? GetInputRecordHandlerForReturnType<T>
  : T extends ComposableHandler ? GetComposableHandlerReturnType<T>
  : never;

// helpers
type GetInputRecordHandlerForSyncType<
  T extends InputRecordHandler,
> = {
  [K in keyof T]: T[K] extends HandlerFunction ? GetFunctionSyncType<T[K]>
    : T[K] extends ComposableHandler ? GetFunctionSyncType<T[K]["handle"]>
    : T[K] extends InputRecordHandler ? GetInputRecordHandlerForSyncType<T[K]>
    : never;
}[keyof T];

type GetInputRecordHandlerForReturnType<
  T extends InputRecordHandler,
> = {
  [K in keyof T]: T[K] extends HandlerFunction ? GetFunctionReturnType<T[K]>
    : T[K] extends ComposableHandler ? GetFunctionReturnType<T[K]["handle"]>
    : T[K] extends InputRecordHandler ? GetInputRecordHandlerForReturnType<T[K]>
    : never;
}[keyof T];
