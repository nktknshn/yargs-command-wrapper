import y from "yargs";

import {
  addSubcommands,
  buildAndParseUnsafe,
  buildYargs,
  command,
  composeCommands,
} from "../src";

let command1 = command("command1", "desc", (y) =>
  y.options(
    { a: { type: "string" } },
  ));

let a = buildAndParseUnsafe(command1);
