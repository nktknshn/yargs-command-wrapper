import y from "yargs";
import * as E from "./either";
import { ErrorType } from "./error";
import { isObjectWithOwnProperty } from "./util";

export function fail(
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
