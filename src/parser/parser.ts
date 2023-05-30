import y from "yargs";
import { buildYargs } from "../command/build-yargs";
import { Command } from "../command/commands/command";
import { GetCommandParseResult } from "../command/commands/type-parse-result";
import { getCommandName } from "../command/helpers";
import { YargsCommandBuilder } from "../command/types";
import * as E from "../common/either";
import { ErrorType } from "../common/error";
import { appendSubcommand } from "./helpers";

/**
 * @description Given a command and an alias, if the alias is found in the command
 * @param command
 * @returns Either an error or a tuple of the full command name and the subcommands if any
 */
export const findAlias = <TCommand extends Command>(
  command: TCommand,
  alias: string,
): E.Either<ErrorType, [string, Command | undefined]> => {
  if (command.type === "command") {
    for (const cmd of command.commandDesc) {
      // console.log(`cmd: ${cmd}, ${alias}`);
      if (cmd == alias) {
        return E.of([getCommandName(command.commandDesc[0]), undefined]);
      }
      else if (cmd.startsWith(`${alias} `)) {
        return E.of([alias, undefined]);
      }
    }
  }
  else if (command.type === "with-subcommands") {
    if (command.command.commandDesc.includes(alias)) {
      return E.of(
        [command.command.commandDesc[0], command.subcommands],
      );
    }
  }
  else if (command.type === "composed") {
    for (const cmd of command.commands) {
      // console.log(`cmd: ${showCommand(cmd)}`);
      const found = findAlias(cmd, alias);

      if (E.isRight(found)) {
        return found;
      }
    }
  }

  return E.left({
    error: "command not found",
    message: `Alias ${alias} was not found in any command ${command.type}`,
  });
};

const createYargs = () => {
  return y().exitProcess(false)
    .showHelpOnFail(false)
    .fail((msg, err, yargs) => {
      if (err) throw err;
      if (msg) throw new Error(msg);
    })
    .demandCommand(1)
    .strict()
    .strictCommands();
};

export const build = <TCommand extends Command>(command: TCommand) =>
  buildYargs(command)(createYargs());

type BuildAndParseResult<TCommand extends Command> = {
  result: E.Either<ErrorType, GetCommandParseResult<TCommand>>;
  yargs: y.Argv;
};

export const buildAndParse = <TCommand extends Command>(
  command: TCommand,
  arg?: string | readonly string[],
  builder?: YargsCommandBuilder<{}>,
): BuildAndParseResult<TCommand> => {
  const yargsObject = build(command);

  return {
    result: parse(
      command,
      builder ? builder(yargsObject) : yargsObject,
      arg,
    ),
    yargs: yargsObject,
  };
};

export const buildAndParseUnsafe = <TCommand extends Command>(
  command: TCommand,
  arg?: string | readonly string[],
): { result: GetCommandParseResult<TCommand>; yargs: y.Argv } => {
  const { result, yargs } = buildAndParse(command, arg);

  if (E.isLeft(result)) {
    throw new Error(result.left.message);
  }
  return { result: result.right, yargs };
};

export const buildAndParseUnsafeR = <TCommand extends Command>(
  command: TCommand,
  arg?: string | readonly string[],
): GetCommandParseResult<TCommand> => {
  const { result } = buildAndParse(command, arg);

  if (E.isLeft(result)) {
    throw new Error(result.left.message);
  }
  return result.right;
};

export const parse = <TCommand extends Command>(
  command: TCommand,
  yargsObject: y.Argv,
  arg?: string | readonly string[],
  stripArgv = true,
): E.Either<ErrorType, GetCommandParseResult<TCommand>> => {
  try {
    const argv = arg !== undefined
      ? yargsObject.parseSync(arg)
      : yargsObject.parseSync();

    let result: Record<string, unknown> = {};

    let currentCommand: Command | undefined = command;

    const parsedCommands = argv._;
    const withIndex = parsedCommands.map(String).map((x, idx) =>
      [idx, x] as const
    );

    for (let [idx, cmd] of withIndex) {
      if (currentCommand === undefined) {
        return E.left({
          error: "command not found",
          message: "out of commands",
        });
      }

      const alias: E.Either<ErrorType, [string, Command | undefined]> =
        findAlias(
          currentCommand,
          cmd,
        );

      if (E.isLeft(alias)) {
        return alias;
      }

      [cmd, currentCommand] = alias.right;

      result = appendSubcommand(result, cmd);
      // const prefix = replicate(idx, `sub`).join("");

      // result[`${prefix}command`] = cmd;
    }

    let _argv: Partial<typeof argv> = { ...argv };
    if (stripArgv) {
      delete _argv["_"];
      delete _argv["$0"];
    }
    result["argv"] = _argv;

    return E.of(result as GetCommandParseResult<TCommand>);
  } catch (e) {
    return E.left({ error: "yargs error", message: String(e) });
  }
};
