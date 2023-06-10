import { EmptyRecord } from "../../common/types";
import { GetFunctionSyncType } from "../type-helpers";
import { HandlerFunction } from "./type";

export type HandlerFunctionExtendArgs<
  T extends HandlerFunction<never>,
  TArgs extends EmptyRecord,
> = T extends HandlerFunction<
  infer THandlerArgs,
  infer TSyncType,
  infer TResult
> ? HandlerFunction<THandlerArgs | TArgs, GetFunctionSyncType<T>, TResult>
  : never;
