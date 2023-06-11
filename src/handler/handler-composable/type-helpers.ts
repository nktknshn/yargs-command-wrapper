import { CommandArgs } from "../../command/commands/args/type-command-args";
import { GetFunctionReturnType, GetFunctionSyncType } from "../type-helpers";
import { ComposableHandler } from "./type-composable-handler";

export type GetComposableHandlerSyncType<
  T extends ComposableHandler,
> = GetFunctionSyncType<T["handle"]>;

export type GetComposableHandlerReturnType<
  T extends ComposableHandler,
> = GetFunctionReturnType<T["handle"]>;

export type GetComposableHandlerNames<
  T extends ComposableHandler,
> = T extends ComposableHandler<never, infer TNames> ? TNames : never;

export type GetComposableHandlerArgv<
  T extends ComposableHandler,
> = Parameters<T["handle"]>[0];
