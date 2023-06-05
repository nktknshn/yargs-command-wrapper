import { Cast, ToList, TupleKeys } from "../../../common/types-util";
import { CommandArgs } from "./type-command-args";
import {
  CommandArgsGeneric,
  IntersectionToNames,
} from "./type-command-args-generic";

/**
 * @description Add a command to the args prefixing other commands with "sub"
 */
export type PushCommand<
  T extends CommandArgs,
  C extends string,
  TArgv,
> = ToList<T> extends infer TS ? {
    [P in TupleKeys<TS>]: _PushCommand<Cast<TS[P], CommandArgs>, C, TArgv>;
  }[TupleKeys<TS>]
  : never;

/**
 * @description
 */
type _PushCommand<
  T extends CommandArgs,
  C extends string,
  TArgv,
> = IntersectionToNames<T> extends infer CS ? CommandArgsGeneric<
    T["argv"] & TArgv,
    [C, ...Cast<CS, readonly string[]>]
  >
  : never;
