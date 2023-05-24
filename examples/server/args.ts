import { addSubcommands, command, composeCommands } from "../../src";
import { parseAddress } from "../common";

export const cmd = composeCommands(
  _ => _.option("debug", { alias: "d", type: "boolean", default: false }),
  command(
    "start",
    "start server",
    _ => _.positional("address", { type: "string", coerce: parseAddress }),
  ),
  command(
    "status",
    "get server status",
    _ => _.option("json", { type: "boolean", default: false }),
  ),
  command(
    "stop",
    "stop server",
    _ => _.option("grateful", { type: "boolean", default: true }),
  ),
  addSubcommands(
    command("config", "config management", _ =>
      _.options({
        file: { type: "string", default: "config.json" },
      })),
    composeCommands(
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
    ),
  ),
);
