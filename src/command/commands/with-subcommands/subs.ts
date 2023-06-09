import y from "yargs";

import { isObjectWithOwnProperty } from "../../../common/util";
import { Command } from "../command";

import { CommandsTuple, YargsCommandBuilder } from "../../types";
import { CommandBasic } from "../basic/type";

import { WrapperError } from "../../../common/error";
import { EmptyRecord } from "../../../common/types";
import { command } from "../basic/command";
import { GetCommandNameFromDesc } from "../basic/type-command-name";
import { composeCommands } from "../composed/compose-commands";
import { createHelperObject } from "../composed/helper-object";
import { CommandComposed } from "../composed/type";
import {
  CommandComposedWithSubcommands,
  HelperObjectWithSubcommands,
  SubsProps,
} from "./type";

type DefaultProps = { selfHandle: false };

type SubsReturnType<
  TCommandName extends string,
  TCommands extends readonly Command[],
  TArgv extends EmptyRecord,
  TComposedArgv extends EmptyRecord,
  TSubsProps extends SubsProps,
> =
  & CommandComposedWithSubcommands<
    TCommandName,
    TCommands,
    TArgv,
    TComposedArgv,
    TSubsProps
  >
  & {
    $: HelperObjectWithSubcommands<
      CommandComposedWithSubcommands<
        TCommandName,
        TCommands,
        TArgv,
        EmptyRecord,
        TSubsProps
      >
    >;
  };

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
): SubsReturnType<
  TCommandName,
  TCommands,
  TArgv,
  EmptyRecord,
  DefaultProps
>;

export function subs<
  TCommandName extends string,
  TArgv extends EmptyRecord,
  TCommands extends Command[],
  TComposedArgv extends EmptyRecord,
>(
  command: CommandBasic<TCommandName, TArgv>,
  subcommands: CommandComposed<TCommands, TComposedArgv>,
): SubsReturnType<
  TCommandName,
  TCommands,
  // XXX why intersection?
  TArgv & TComposedArgv,
  // XXX not TComposedArgv?
  EmptyRecord,
  DefaultProps
>;

// new overloads
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
): SubsReturnType<
  GetCommandNameFromDesc<TCommandDesc>,
  TCommands,
  TArgv,
  TComposedArgv,
  DefaultProps
>;

export function subs<
  const TCommandDesc extends readonly string[] | string,
  const TCommands extends readonly Command[],
  TComposedArgv extends EmptyRecord,
>(
  commandDesc: TCommandDesc,
  description: string,
  subcommands: CommandComposed<TCommands, TComposedArgv> | TCommands,
): SubsReturnType<
  GetCommandNameFromDesc<TCommandDesc>,
  TCommands,
  EmptyRecord,
  TComposedArgv,
  DefaultProps
>;

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
  & { $: HelperObjectWithSubcommands<CommandComposedWithSubcommands> }
{
  if (
    typeof commandOrCommandDesc === "string"
    || Array.isArray(commandOrCommandDesc)
  ) {
    // overload 2 or 3
    if (!(typeof subcommandsOrDescription === "string")) {
      throw WrapperError.create("Invalid overload");
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
        throw WrapperError.create("Invalid overload");
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
        throw WrapperError.create("Invalid overload");
      }
    }
  }
  else {
    if (typeof subcommandsOrDescription === "string") {
      throw WrapperError.create("Invalid overload");
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
): SubsReturnType<
  TCommandName,
  TCommands,
  TArgv,
  TComposedArgv,
  SubsProps
> {
  if (
    isObjectWithOwnProperty(subcommands, "type")
    && subcommands.type === "composed"
  ) {
    const helperObject = createHelperObject<TCommands, TArgv & TComposedArgv>(
      subcommands.commands,
    );

    const resultCommand = {
      command,
      subcommands,
      type: "with-subcommands",
      props: { selfHandle: false },
    } as const;

    return {
      ...resultCommand,
      $: {
        ...helperObject,
        selfHandle: value => ({
          ...resultCommand,
          props: { selfHandle: value },
        }),
      },
    };
  }

  const s = subcommands as TCommands;

  const composedCommand = composeCommands<TCommands, TArgv & TComposedArgv>(
    ...s,
  );
  const helperObject = createHelperObject<TCommands, TArgv & TComposedArgv>(s);

  const resultCommand = {
    command,
    subcommands: composedCommand,
    type: "with-subcommands",
    props: { selfHandle: false },
  } as const;

  return {
    ...resultCommand,
    $: {
      ...helperObject,
      selfHandle: value => ({ ...resultCommand, props: { selfHandle: value } }),
    },
  };
}
