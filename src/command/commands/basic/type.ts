import { EmptyRecord } from "../../../common/types";
import { YargsCommandBuilder } from "../../types";

export type CommandBasic<
  TCommandName extends string = string,
  TArgv extends EmptyRecord = EmptyRecord,
> = {
  readonly commandName: TCommandName;
  readonly commandDesc: readonly string[];
  readonly description: string;
  readonly builder: YargsCommandBuilder<TArgv>;
  readonly type: "command";
};
