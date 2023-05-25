import { isPromiseLike } from "tsafe";
import y from "yargs";
import { Either } from ".";
import * as E from "./either";
import { ErrorType } from "./error";
import { HandlerFunctionFor, HandlerType } from "./handler";
import { buildAndParse } from "./parser";
import { Command } from "./types";
import { isObjectWithOwnProperty } from "./util";

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

  if (Either.isLeft(result)) {
    failClient(yargs, result);
  }
  const res = (handler as any)(result.right);

  if (isPromiseLike(res)) {
    await res;
  }
};
