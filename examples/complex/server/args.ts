import { comm, comp, subs } from "../../../src";
import { parseAddress } from "../common";

export const cmd = comp(
  _ => _.option("debug", { alias: "d", type: "boolean", default: false }),
  comm(
    "start",
    "start server",
    _ => _.positional("address", { type: "string", coerce: parseAddress }),
  ),
  comm(
    "status",
    "get server status",
    _ => _.option("json", { type: "boolean", default: false }),
  ),
  comm(
    "stop",
    "stop server",
    _ => _.option("grateful", { type: "boolean", default: true }),
  ),
  subs(
    comm("config", "config management", _ =>
      _.options({
        file: { type: "string", default: "config.json" },
      })),
    comp(
      comm(
        "get [key]",
        "get config value",
        _ => _.positional("key", { type: "string" }),
      ),
      comm(
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
