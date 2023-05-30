import { YargsCommandBuilder } from "../../types";

export type BasicCommand<
  TCommandName extends string = string,
  TArgv extends {} = {},
> = {
  readonly commandName: TCommandName;
  readonly commandDesc: readonly string[];
  readonly description: string;
  readonly builder: YargsCommandBuilder<TArgv>;
  readonly type: "command";
};
