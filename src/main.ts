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
  error: string | ErrorType | E.Left<ErrorType> | undefined = undefined,
  stderr = false,
): never {
  let f = console.log.bind(console.log);

  if (stderr) {
    f = console.error.bind(console.error);
  }

  yargs.showHelp(stderr ? "error" : "log");

  if (typeof error === "string") {
    f();
    f(error);
  }
  else if (isObjectWithOwnProperty(error, "message")) {
    f();
    f(error.message);
  }
  else if (error !== undefined) {
    f();
    f(error.left.message);
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
