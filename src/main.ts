import y from "yargs";
import { GetCommandArgs } from "./command";
import { Command } from "./command/commands/command";
import * as E from "./common/either";
import { ErrorType } from "./common/error";
import { isObjectWithOwnProperty, isPromiseLike } from "./common/util";
import { buildAndParse, YargsObject } from "./parser/parser";

/**
 * @description show help and error message and exit with code 1
 * @param yargs yargs object built from command
 * @returns
 */
export function failClient(
  yargs: y.Argv,
  error: string | ErrorType | E.Left<ErrorType>,
): never {
  yargs.showHelp();
  console.error();

  if (typeof error === "string") {
    console.error(error);
  }
  else if (isObjectWithOwnProperty(error, "message")) {
    console.error(error.message);
  }
  else {
    console.error(error.left.message);
  }

  process.exit(1);
}

export const createMain = <
  TCommand extends Command,
>(
  cmd: TCommand,
  mainFunction: (result: {
    yargs: YargsObject;
    args: GetCommandArgs<TCommand>;
  }) => Promise<void> | void,
) =>
async () => {
  const parseResult = buildAndParse(cmd, process.argv.slice(2));

  if (E.isLeft(parseResult.result)) {
    failClient(parseResult.yargs, parseResult.result);
  }

  const res = mainFunction({
    yargs: parseResult.yargs,
    args: parseResult.result.right,
  });

  if (isPromiseLike(res)) {
    await res;
  }
};
