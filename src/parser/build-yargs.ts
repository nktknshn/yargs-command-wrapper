import y from "yargs";
import { Command } from "../command/commands/command";

/**
 * @description Given a command, build the yargs object
 * @param command The command to build the yargs object from
 * @returns The yargs object
 */
export const buildYargs = <TCommand extends Command>(
  command: TCommand,
) =>
(yargsObject: y.Argv): y.Argv => {
  // console.log(`command: ${showCommand(command)}`);

  if (command.type === "command") {
    return yargsObject.command(
      command.commandDesc,
      command.description,
      command.builder,
    );
  }
  else if (command.type === "composed") {
    yargsObject = yargsObject.demandCommand(1);

    return command.commands.reduce(
      (acc, cur) => buildYargs(cur)(acc),
      command.builder ? command.builder(yargsObject) : yargsObject,
    );
  }
  else if (command.type === "with-subcommands") {
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

export const build = <TCommand extends Command>(command: TCommand) =>
  buildYargs(command)(createYargs());

const createYargs = () => {
  return y().exitProcess(false)
    .showHelpOnFail(false)
    .fail((msg, err) => {
      if (err) throw err;
      if (msg) throw new Error(msg);
    })
    .demandCommand(1)
    .strict()
    .strictCommands();
};
