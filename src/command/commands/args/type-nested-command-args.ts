import { EmptyRecord } from "../../../common/types";
import { CommandArgsGeneric } from "./type-command-args-generic";

// export type NestedCommandArgs<
//   TArgv extends EmptyRecord,
//   TName extends string,
//   TSubName extends string,
// > = {
//   "subcommand": TSubName;
//   "command": TName;
//   "argv": TArgv;
// };

export type NestedCommandArgs<
  TArgv extends EmptyRecord = EmptyRecord,
  TName extends string = string,
  TSubName extends string = string,
> = CommandArgsGeneric<TArgv, [TName, TSubName]>;
