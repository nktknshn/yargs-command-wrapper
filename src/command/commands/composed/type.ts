import { YargsCommandBuilder } from "../../types";
import { Command } from "../command";
import { CommandsFlatten, GetCommandName } from "./type-helpers";

export type ComposedCommands<
  TCommands extends readonly Command[] = readonly Command[],
  TArgv extends {} = {},
> = {
  readonly commands: TCommands;
  readonly builder?: YargsCommandBuilder<TArgv>;
  readonly type: "composed";
};

export type HelperObjectComposed<
  TCommands extends readonly Command[],
  TArgv extends {},
> = {
  readonly commands: {
    [C in CommandsFlatten<TCommands> as GetCommandName<C>]: C;
  };
};
