/* eslint-disable no-empty */
import { isObjectWithOwnProperty } from "../../../common/util";
import { Command } from "../command";

import { CommandsTuple, YargsCommandBuilder } from "../../types";
import { CommandBasic } from "../basic/type";

import y from "yargs";
import { EmptyRecord } from "../../../common/types";
import { command } from "../basic/command";
import { GetCommandNameFromDesc } from "../basic/type-command-name";
import { composeCommands } from "../composed/compose-commands";
import { createHelperObject } from "../composed/helper-object";
import { CommandComposed } from "../composed/type";
import {
  CommandComposedWithSubcommands,
  HelperObjectWithSubcommands,
} from "./type";

/**
 * @description A command with subcommands
 * @param command the parent basic command
 * @param subcommands either a composed command or a tuple of commands
 * @returns a command with subcommands
 */
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
  > // XXX why?
  & { $: HelperObjectWithSubcommands<TCommands, TArgv & TComposedArgv> };

// new overload
export function subs<
  const TCommandDesc extends readonly string[] | string,
  TArgv extends EmptyRecord,
  const TCommands extends readonly Command[],
  TComposedArgv extends EmptyRecord,
>(
  commandDesc: TCommandDesc,
  description: string,
  builder: (parent: y.Argv<EmptyRecord>) => y.Argv<TArgv>,
  subcommands: CommandComposed<TCommands, TComposedArgv> | TCommands,
):
  & CommandComposedWithSubcommands<
    GetCommandNameFromDesc<TCommandDesc>,
    TCommands,
    TArgv,
    TComposedArgv
  >
  & { $: HelperObjectWithSubcommands<TCommands, TArgv> };

// new overload
export function subs<
  const TCommandDesc extends readonly string[] | string,
  const TCommands extends readonly Command[],
  TComposedArgv extends EmptyRecord,
>(
  commandDesc: TCommandDesc,
  description: string,
  subcommands: CommandComposed<TCommands, TComposedArgv> | TCommands,
): CommandComposedWithSubcommands<
  GetCommandNameFromDesc<TCommandDesc>,
  TCommands,
  EmptyRecord,
  TComposedArgv
>;
// & { $: HelperObjectWithSubcommands<TCommands, TComposedArgv> };

export function subs(
  commandOrCommandDesc: CommandBasic | string,
  subcommandsOrDescription:
    | CommandComposed<CommandsTuple, EmptyRecord>
    | CommandsTuple
    | string,
  builderOrSubcommands?:
    | YargsCommandBuilder<EmptyRecord>
    | CommandsTuple
    | CommandComposed<CommandsTuple, EmptyRecord>,
  subcommands?: CommandComposed<CommandsTuple, EmptyRecord>,
):
  & CommandComposedWithSubcommands
  & { $: HelperObjectWithSubcommands<readonly Command[], EmptyRecord> }
{
  if (
    typeof commandOrCommandDesc === "string"
    || Array.isArray(commandOrCommandDesc)
  ) {
    // overload 2 or 3
    if (!(typeof subcommandsOrDescription === "string")) {
      throw new Error("Invalid overload");
    }

    if (typeof builderOrSubcommands === "function") {
      const parentCommand = command(
        commandOrCommandDesc,
        subcommandsOrDescription,
        builderOrSubcommands,
      );

      if (subcommands !== undefined) {
        return overload12(parentCommand, subcommands);
      }
      else {
        throw new Error("Invalid overload");
      }
    }
    else {
      if (builderOrSubcommands !== undefined) {
        const parentCommand = command(
          commandOrCommandDesc,
          subcommandsOrDescription,
        );
        return overload12(parentCommand, builderOrSubcommands);
      }
      else {
        throw new Error("Invalid overload");
      }
    }
  }
  else {
    if (typeof subcommandsOrDescription === "string") {
      throw new Error("Invalid overload");
    }
    // overload 1 or 2
    return overload12(
      commandOrCommandDesc,
      subcommandsOrDescription,
    );
  }
}

function overload12<
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
