import { isObjectWithOwnProperty } from "../../../common/util";
import { Command } from "../command";

import { CommandsTuple } from "../../types";
import { CommandBasic } from "../basic/type";

import { composeCommands } from "../composed/compose-commands";
import { createHelperObject } from "../composed/helper-object";
import { CommandComposed } from "../composed/type";
import {
  CommandComposedWithSubcommands,
  HelperObjectWithSubcommands,
} from "./type";

export function subs<
  TCommandName extends string,
  TArgv extends {},
  const TCommands extends readonly Command[],
>(
  command: CommandBasic<TCommandName, TArgv>,
  subcommands: TCommands,
):
  & CommandComposedWithSubcommands<TCommandName, TCommands, TArgv, {}>
  & { $: HelperObjectWithSubcommands<TCommands, TArgv> };

export function subs<
  TCommandName extends string,
  TArgv extends {},
  TCommands extends Command[],
  TComposedArgv extends {},
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
  TArgv extends {},
  TCommands extends CommandsTuple,
  TComposedArgv extends {},
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
  & { $: HelperObjectWithSubcommands<TCommands, TArgv> }
{
  if (
    isObjectWithOwnProperty(subcommands, "type")
    && subcommands.type === "composed"
  ) {
    const helperObject = createHelperObject(subcommands.commands);
    return { command, subcommands, type: "with-subcommands", $: helperObject };
  }
  const s = subcommands as TCommands;

  const composedCommand = composeCommands<TCommands, TComposedArgv>(...s);
  const helperObject = createHelperObject(s);

  return {
    command,
    subcommands: composedCommand,
    type: "with-subcommands",
    $: helperObject,
  };
}
