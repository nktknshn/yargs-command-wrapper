import { YargsCommandBuilder } from "../../types";
import { Command } from "../command";
import { CommandsFlatten, GetCommandName } from "./type-helpers";

export type ComposedCommands<
  TCommands extends readonly Command[] = readonly Command[],
  TArgv extends {} = {},
> = {
  commands: TCommands;
  builder?: YargsCommandBuilder<TArgv>;
  type: "composed";
};

export type HelperObjectComposed<
  TCommands extends readonly Command[],
  TArgv extends {},
> = {
  commands: {
    [C in CommandsFlatten<TCommands> as GetCommandName<C>]: C;
  };
};
