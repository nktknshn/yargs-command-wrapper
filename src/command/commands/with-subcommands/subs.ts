import { isObjectWithOwnProperty } from "../../../common/util";
import { Command } from "../command";

import { CommandsTuple } from "../../types";
import { CommandBasic } from "../basic/type";

import { EmptyRecord } from "../../../common/types";
import { composeCommands } from "../composed/compose-commands";
import { createHelperObject } from "../composed/helper-object";
import { CommandComposed } from "../composed/type";
import {
  CommandComposedWithSubcommands,
  HelperObjectWithSubcommands,
} from "./type";

export function subs<
  TCommandName extends string,
  TArgv extends EmptyRecord,
  const TCommands extends readonly Command[],
>(
  command: CommandBasic<TCommandName, TArgv>,
  subcommands: TCommands,
):
  & CommandComposedWithSubcommands<
    TCommandName,
    TCommands,
    TArgv,
    EmptyRecord
  >
  & { $: HelperObjectWithSubcommands<TCommands, TArgv> };

export function subs<
  TCommandName extends string,
  TArgv extends EmptyRecord,
  TCommands extends Command[],
  TComposedArgv extends EmptyRecord,
>(
  command: CommandBasic<TCommandName, TArgv>,
  subcommands: CommandComposed<TCommands, TComposedArgv>,
):
  & CommandComposedWithSubcommands<
    TCommandName,
    TCommands,
    TArgv & TComposedArgv
  >
  & { $: HelperObjectWithSubcommands<TCommands, TArgv> };

export function subs<
  TCommandName extends string,
  TArgv extends EmptyRecord,
  TCommands extends CommandsTuple,
  TComposedArgv extends EmptyRecord,
>(
  command: CommandBasic<TCommandName, TArgv>,
  subcommands: CommandComposed<TCommands, TComposedArgv> | TCommands,
):
  & CommandComposedWithSubcommands<
    TCommandName,
    TCommands,
    TArgv,
    TComposedArgv
  >
  & { $: HelperObjectWithSubcommands<TCommands, TArgv & TComposedArgv> }
{
  if (
    isObjectWithOwnProperty(subcommands, "type")
    && subcommands.type === "composed"
  ) {
    const helperObject = createHelperObject<TCommands, TArgv & TComposedArgv>(
      subcommands.commands,
    );

    return { command, subcommands, type: "with-subcommands", $: helperObject };
  }
  const s = subcommands as TCommands;

  const composedCommand = composeCommands<TCommands, TArgv & TComposedArgv>(
    ...s,
  );
  const helperObject = createHelperObject<TCommands, TArgv & TComposedArgv>(s);

  return {
    command,
    subcommands: composedCommand,
    type: "with-subcommands",
    $: helperObject,
  };
}
