import { EmptyRecord } from "../../../common/types";
import { CommandArgsGeneric } from "./type-command-args-generic";

/**
 * @description The base type for the result returned by a parser a command with a subcommand
 */
export type NestedCommandArgs<
  TArgv extends EmptyRecord = EmptyRecord,
  TName extends string = string,
  TSubName extends string = string,
> = CommandArgsGeneric<TArgv, [TName, TSubName]>;
