import y from "yargs";
import { YargsCommandBuilder } from "../../types";
import { getCommandNameFromDesc } from "./helpers";
import { CommandBasic } from "./type";
import { GetCommandNameFromDesc } from "./type-command-name";

// import debug from 'debug'
/**
 * @description Create a single command. This is the most basic command type.
 * @param commandDesc The command description. If it contains a space, the first word will be used as the command name. It may also be an array of strings, in which case the first element will be used as the command name and other elements will be used as aliases.
 * @param description The command description to be displayed in help.
 * @param builder A function that takes a yargs instance and returns a yargs instance. This is where you add options and arguments to the command.
 * @returns A typed command object.
 */
// dprint-ignore
export const command = <const TCommandDesc extends readonly string[] | string, TArgv extends {}>(
  // XXX the line above requires typescript ^5.0
  commandDesc: TCommandDesc,
  description: string,
  // XXX try to avoid using `as` here
  builder: YargsCommandBuilder<TArgv> = (yargs) => yargs as y.Argv<TArgv>
): CommandBasic<GetCommandNameFromDesc<TCommandDesc>, TArgv> => {
  const _commandDesc: readonly string[] = typeof commandDesc === "string"
    ? [commandDesc]
    : commandDesc;

  const commandName = getCommandNameFromDesc(_commandDesc[0]) as GetCommandNameFromDesc<TCommandDesc>;

  return ({
    builder,
    commandDesc: _commandDesc,
    commandName,
    description,
    type: "command",
  });
};
