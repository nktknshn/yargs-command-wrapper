import y from "yargs";
import { buildYargs } from "./builder";
import { getCommandName } from "./common";
import * as E from "./either";
import { ErrorType } from "./error";
import { Builder, Command, GetCommandReturnType } from "./types";
import { replicate } from "./util";

/**
 * @description Given a command and an alias, if the alias is found in the command
 * @param command
 * @returns Either an error or a tuple of the full command name and the subcommands if any
 */
export const findAlias = <TCommand extends Command>(
  command: TCommand,
  alias: string,
): E.Either<ErrorType, [string, Command | undefined]> => {
  // console.log(`command: ${showCommand(command)}, alias: ${alias}`);
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
    // if (command.commandDesc.includes(alias)) {
    //   return E.of([command.commandDesc[0], undefined]);
    // }
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
    message: `Alias ${alias} was not found in any command ${command.type}}`,
  });
};

const createYargs = () => {
  return y.exitProcess(false)
    .showHelpOnFail(false)
    .fail((msg, err, yargs) => {
      if (err) throw err;
      if (msg) throw new Error(msg);
    })
    .strict()
    .strictCommands();
};

export const build = <TCommand extends Command>(command: TCommand) =>
  buildYargs(command)(createYargs());

// export const buildAndParseO = <TCommand extends Command>(
//   command: TCommand,
//   arg?: string | readonly string[],
// ): {
//   result: E.Either<ErrorType, GetCommandReturnType<TCommand>>;
//   yargs: y.Argv;
// } => {
//   const yargsObject = build(command);

//   return {
//     result: parse(command, yargsObject, arg),
//     yargs: yargsObject,
//   };
// };

export const buildAndParse = <TCommand extends Command>(
  command: TCommand,
  arg?: string | readonly string[],
  builder?: Builder<{}>,
): {
  result: E.Either<ErrorType, GetCommandReturnType<TCommand>>;
  yargs: y.Argv;
} => {
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
): GetCommandReturnType<TCommand> => {
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
): E.Either<ErrorType, GetCommandReturnType<TCommand>> => {
  try {
    const argv = arg ? yargsObject.parseSync(arg) : yargsObject.parseSync();

    const result: Record<string, unknown> = {};
    let currentCommand: Command | undefined = command;

    const withIndex = argv._.map(String).map((x, idx) => [idx, x] as const);

    for (let [idx, cmd] of withIndex) {
      const prefix = replicate(idx, `sub`).join("");

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

      result[`${prefix}command`] = cmd;
    }

    result["argv"] = argv;

    // console.log(`result: ${JSON.stringify(result, null, 2)}`);
    return E.of(result as GetCommandReturnType<TCommand>);
  } catch (e) {
    return E.left({ error: "yargs error", message: String(e) });
  }
};
