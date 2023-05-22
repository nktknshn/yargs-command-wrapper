import * as y from "yargs";
import { getCommandName } from "./common";
import {
  BasicCommand,
  Builder,
  Command,
  CommandWithSubcommands,
  ComposedCommands,
  GetCommandName,
} from "./types";
import { isObjectWithOwnProperty } from "./util";
// import debug from 'debug'

/**
 * @description Create a single command. This is the most basic command type.
 * @param commandDesc The command description. If it contains a space, the first word will be used as the command name. It may also be an array of strings, in which case the first element will be used as the command name and other elements will be used as aliases.
 * @param description The command description to be displayed in help.
 * @param builder A function that takes a yargs instance and returns a yargs instance. This is where you add options and arguments to the command.
 * @returns A typed command object.
 */
// dprint-ignore
export const command = <const TCommandDesc extends readonly string[] | string, TArgv>(
  // XXX the line above requires typescript ^5.0
  commandDesc: TCommandDesc,
  description: string,
  // XXX try to avoid using `as` here
  builder: Builder<TArgv> = (yargs) => yargs as y.Argv<TArgv>,
): BasicCommand<GetCommandName<TCommandDesc>, TArgv> => {
  const _commandDesc: readonly string[] = typeof commandDesc === "string"
    ? [commandDesc]
    : commandDesc;

  const commandName = getCommandName(_commandDesc[0]) as GetCommandName<TCommandDesc>;

  return ({
    builder,
    commandDesc: _commandDesc,
    commandName,
    description,
    type: "command",
  });
};

/**
 * @description Create a command with subcommands.
 * @param
 * @returns
 */
export function composeCommands<TCommands extends Command[], TArgv>(
  builder: Builder<TArgv>,
  ...commands: TCommands
): ComposedCommands<TCommands, TArgv>;

export function composeCommands<TCommands extends Command[]>(
  ...commands: TCommands
): ComposedCommands<TCommands>;

export function composeCommands<TCommands extends Command[], TArgv>(
  builder: Builder<TArgv> | TCommands,
  ...commands: TCommands
): ComposedCommands<TCommands, TArgv> {
  let _builder = undefined;

  // logger.debug(`builder: ${typeof builder}`);
  // logger.debug(`commands: ${commands.map(showCommand).join(", ")}`);

  if (typeof builder !== "function") {
    commands = [builder, ...commands] as TCommands;
    _builder = undefined;
  }
  else {
    _builder = builder;
  }

  // logger.debug(`_builder: ${_builder}`);

  return { commands, builder: _builder, type: "composed" };
}

export function addSubcommands<
  TCommandName extends string,
  TArgv,
  const TCommands extends readonly Command[],
>(
  command: BasicCommand<TCommandName, TArgv>,
  subcommands: TCommands,
): CommandWithSubcommands<TCommandName, TArgv, TCommands, {}>;

export function addSubcommands<
  TCommandName extends string,
  TArgv,
  TCommands extends Command[],
  TComposedArgv,
>(
  command: BasicCommand<TCommandName, TArgv>,
  subcommands: ComposedCommands<TCommands, TComposedArgv>,
): CommandWithSubcommands<TCommandName, TArgv & TComposedArgv, TCommands>;

export function addSubcommands<
  TCommandName extends string,
  TArgv,
  TCommands extends Command[],
  TComposedArgv,
>(
  command: BasicCommand<TCommandName, TArgv>,
  subcommands: ComposedCommands<TCommands, TComposedArgv> | TCommands,
): CommandWithSubcommands<TCommandName, TArgv, TCommands, TComposedArgv> {
  if (
    isObjectWithOwnProperty(subcommands, "type")
    && subcommands.type === "composed"
  ) {
    return { command, subcommands: subcommands, type: "with-subcommands" };
  }

  return {
    command,
    subcommands: composeCommands(
      ...subcommands,
    ) as ComposedCommands<TCommands, TComposedArgv>,
    type: "with-subcommands",
  };
}

export const buildYargs = <TCommand extends Command>(
  command: TCommand,
) =>
(yargsObject: y.Argv): y.Argv => {
  // logger.debug(`command: ${showCommand(command)}`);

  if (command.type === "command") {
    // logger.debug(`command: ${command.commandName} '${command.commandDesc}'`);

    return yargsObject.command(
      command.commandDesc,
      command.description,
      command.builder,
    );
  }
  else if (command.type === "composed") {
    // logger.debug(
    //   `composed: ${command.commands.length} commands: ${
    //     command.commands.map(_ => _.type)
    //   }. builder: ${command.builder}`,
    // );
    yargsObject = yargsObject.demandCommand(1);

    return command.commands.reduce(
      (acc, cur) => buildYargs(cur)(acc),
      command.builder ? command.builder(yargsObject) : yargsObject,
    );
  }
  else if (command.type === "with-subcommands") {
    // logger.debug(
    //   `with-subcommands: ${command.command.commandName} '${command.command.commandDesc}' ${command.subcommands.commands.length} subcommands`,
    // );

    return yargsObject.command(
      command.command.commandDesc,
      command.command.description,
      a =>
        buildYargs(command.subcommands)(
          command.command.builder(a).demandCommand(1),
        ),
    );
  }
  else {
    return command;
  }
};
