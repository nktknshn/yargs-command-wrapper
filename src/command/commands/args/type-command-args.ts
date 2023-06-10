import { EmptyRecord } from "../../../common/types";
import { CommandArgsGeneric, CommandName } from "./type-command-args-generic";

/**
 * @description The base type for the result returned by a parser for any command
 */
export type CommandArgs<
  TArgv extends EmptyRecord = EmptyRecord,
  TName extends CommandName = CommandName,
> = CommandArgsGeneric<TArgv, [TName]>;

export type CommandArgsSelfHandle<TArgv extends EmptyRecord = EmptyRecord> =
  CommandArgsGeneric<TArgv, [undefined]>;
