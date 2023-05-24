import { command, composeCommands } from "../../../src";

export const cmd = composeCommands(
  command(
    "get [key]",
    "get config value",
    _ => _.positional("key", { type: "string" }),
  ),
  command(
    "set <key> <value>",
    "set config key",
    _ =>
      _
        .positional("value", { type: "string", demandOption: true })
        .positional("key", { type: "string", demandOption: true }),
  ),
);
