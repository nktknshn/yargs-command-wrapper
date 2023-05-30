import y from "yargs";
import { Command } from "./commands/command";

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
