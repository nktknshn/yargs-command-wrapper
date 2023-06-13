import { comm, comp } from "../../../../src";

export const defaultConfigFile = "config.json";

export const cmd = comp(
  _ =>
    _.option("configFile", {
      alias: "c",
      type: "string",
      default: defaultConfigFile,
    }),
  comm(
    ["get [key]", "g"],
    "get config value",
    _ => _.positional("key", { type: "string" }),
  ),
  comm(
    ["set <key> <value>", "s"],
    "set config key",
    _ =>
      _
        .positional("value", { type: "string", demandOption: true })
        .positional("key", { type: "string", demandOption: true }),
  ),
);
