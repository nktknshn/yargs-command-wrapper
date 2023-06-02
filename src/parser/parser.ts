import y from "yargs";
import { appendSubcommand } from "../command/commands/args/push-command";
import { Command } from "../command/commands/command";
import { GetCommandParseResult } from "../command/commands/type-parse-result";
import { YargsCommandBuilder } from "../command/types";
import * as E from "../common/either";
import { ErrorType } from "../common/error";
import { EmptyRecord } from "../common/types";
import { build } from "./build-yargs";
import { findAlias } from "./helpers";

type BuildAndParseResult<TCommand extends Command> = {
  result: E.Either<ErrorType, GetCommandParseResult<TCommand>>;
  yargs: y.Argv;
};

/**
 * @description build yargs object and parse arguments
 * @param command command object
 * @param arg arguments to parse. if not provided, process.argv.slice(2) is used
 * @returns yargs object and parse result
 */
export const buildAndParse = <TCommand extends Command>(
  command: TCommand,
  arg?: string | readonly string[],
  builder?: YargsCommandBuilder<EmptyRecord>,
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

/**
 * @description Build yargs object and parse arguments. Throw error if failed
 * @param
 * @returns
 */
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

/**
 * @description parse arguments with yargs object built from command
 * @param
 * @returns
 */
export const parse = <TCommand extends Command>(
  command: TCommand,
  yargsObject: y.Argv,
  arg?: string | readonly string[],
  stripArgv = true,
): E.Either<ErrorType, GetCommandParseResult<TCommand>> => {
  try {
    const argv = arg !== undefined
      ? yargsObject.parseSync(arg)
      : yargsObject.parseSync(process.argv.slice(2));

    let result: Record<string, unknown> = {};

    let currentCommand: Command | undefined = command;

    const parsedCommands = argv._;

    for (let cmd of parsedCommands.map(String)) {
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
