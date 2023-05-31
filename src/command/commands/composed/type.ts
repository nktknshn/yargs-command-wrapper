import { EmptyRecord } from "../../../common/types";
import { YargsCommandBuilder } from "../../types";
import { Command } from "../command";
import { AddArgv } from "../type-add-argv";
import { CommandsFlatten, GetCommandName } from "./type-helpers";

/**
 * @description composes multiple commands into a single command.
 */
export type CommandComposed<
  TCommands extends readonly Command[] = readonly Command[],
  TArgv extends EmptyRecord = EmptyRecord,
> = {
  readonly commands: TCommands;
  readonly builder?: YargsCommandBuilder<TArgv>;
  readonly type: "composed";
};

export type HelperObjectComposed<
  TCommands extends readonly Command[],
  TArgv extends EmptyRecord,
> = {
  readonly commands: {
    [C in CommandsFlatten<TCommands> as GetCommandName<C>]:
      & C
      & AddArgv<C, TArgv>;
    // & AddArgv<C, TArgv>;
  };
};
