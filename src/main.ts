import y from "yargs";
import { Command } from "./command/commands/command";
import { Either } from "./common/either";
import * as E from "./common/either";
import { ErrorType } from "./common/error";
import { isObjectWithOwnProperty, isPromiseLike } from "./common/util";
import { HandlerFunctionFor, HandlerType } from "./handler";
import { buildAndParse } from "./parser/parser";

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
  THandler extends HandlerFunctionFor<TCommand, HandlerType>,
>(
  cmd: TCommand,
  handler: THandler,
) =>
async () => {
  const { yargs, result } = buildAndParse(cmd, process.argv.slice(2));

  if (E.isLeft(result)) {
    failClient(yargs, result);
  }
  const res = (handler as any)(result.right);

  if (isPromiseLike(res)) {
    await res;
  }
};
