/**
 * @description CommandArgs is the type of the argument that is passed to the handler
 */

import { EmptyRecord } from "../../../common/types";
import { CommandArgsGeneric } from "./type-command-args-generic";

export type CommandArgs<
  TArgv extends EmptyRecord = EmptyRecord,
  TName extends string = string,
> = CommandArgsGeneric<TArgv, [TName]>;
