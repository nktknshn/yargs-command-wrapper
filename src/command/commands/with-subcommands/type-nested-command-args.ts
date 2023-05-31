import { EmptyRecord } from "../../../common/types";

export type NestedCommandArgs<TArgv extends EmptyRecord = EmptyRecord> = {
  "subcommand": string;
  "command": string;
  "argv": TArgv;
};
