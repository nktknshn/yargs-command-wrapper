import { EmptyRecord } from "../../../common/types";

export type NestedCommandArgs<
  TArgv extends EmptyRecord,
  TName extends string,
  TSubName extends string,
> = {
  "subcommand": TSubName;
  "command": TName;
  "argv": TArgv;
};
