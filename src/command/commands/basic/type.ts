import { YargsCommandBuilder } from "../../types";

export type BasicCommand<
  TCommandName extends string = string,
  TArgv extends {} = {},
> = {
  commandName: TCommandName;
  commandDesc: readonly string[];
  description: string;
  builder: YargsCommandBuilder<TArgv>;
  type: "command";
};
