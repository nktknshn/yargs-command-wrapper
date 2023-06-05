import { EmptyRecord } from "../../../common/types";
import { CommandArgsGeneric } from "./type-command-args-generic";

/**
 * @description The base type for the result returned by a parser for any command
 */
export type CommandArgs<
  TArgv extends EmptyRecord = EmptyRecord,
  TName extends string = string,
> = CommandArgsGeneric<TArgv, [TName]>;
