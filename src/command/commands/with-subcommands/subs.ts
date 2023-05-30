import { isObjectWithOwnProperty } from "../../../common/util";
import { Command } from "../command";

import { CommandsTuple } from "../../types";
import { BasicCommand } from "../basic/type";

import { composeCommands } from "../composed/compose-commands";
import { createHelperObject } from "../composed/helper-object";
import { ComposedCommands } from "../composed/type";
import { CommandWithSubcommands, HelperObjectWithSubcommands } from "./type";

export function subs<
  TCommandName extends string,
  TArgv extends {},
  const TCommands extends readonly Command[],
>(
  command: BasicCommand<TCommandName, TArgv>,
  subcommands: TCommands,
):
  & CommandWithSubcommands<TCommandName, TCommands, TArgv, {}>
  & { $: HelperObjectWithSubcommands<TCommands, TArgv> };

export function subs<
  TCommandName extends string,
  TArgv extends {},
  TCommands extends Command[],
  TComposedArgv extends {},
>(
  command: BasicCommand<TCommandName, TArgv>,
  subcommands: ComposedCommands<TCommands, TComposedArgv>,
):
  & CommandWithSubcommands<TCommandName, TCommands, TArgv & TComposedArgv>
  & { $: HelperObjectWithSubcommands<TCommands, TArgv> };

export function subs<
  TCommandName extends string,
  TArgv extends {},
  TCommands extends CommandsTuple,
  TComposedArgv extends {},
>(
  command: BasicCommand<TCommandName, TArgv>,
  subcommands: ComposedCommands<TCommands, TComposedArgv> | TCommands,
):
  & CommandWithSubcommands<TCommandName, TCommands, TArgv, TComposedArgv>
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
