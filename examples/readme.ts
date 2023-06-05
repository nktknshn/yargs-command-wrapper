/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  buildAndParse,
  command,
  composeCommands,
  createHandlerFor,
  Either,
  failClient,
  subcommands,
} from "../src";

const config = composeCommands(
  _ =>
    _.options({
      file: { alias: "f", type: "string", default: "config.json" },
    }),
  command(
    ["get [key]", "g"],
    "get config value",
    _ => _.positional("key", { type: "string" }),
  ),
  command(
    ["set <key> <value>", "s"],
    "set config key",
    _ =>
      _
        .positional("value", { type: "string", demandOption: true })
        .positional("key", { type: "string", demandOption: true }),
  ),
);

const serverStart = command(
  ["start", "sta"],
  "start server",
  _ => _.option("port", { type: "number", default: 8080 }),
);

const serverStop = command(
  ["stop", "sto"],
  "stop server",
  _ => _.option("force", { type: "boolean", default: false }),
);

const cmd = composeCommands(
  _ => _.option("debug", { alias: "d", type: "boolean", default: false }),
  composeCommands(serverStart, serverStop),
  subcommands(command(["config", "c"], "config management"), config),
);

const { result, yargs } = buildAndParse(cmd, process.argv.slice(2));

if (Either.isLeft(result)) {
  failClient(yargs, result);
}

if (result.right.argv.debug) {
  console.log("debug mode enabled");
}

if (result.right.command === "start") {
  console.log(`starting server on port ${result.right.argv.port}`);
}
else if (result.right.command === "stop") {
  console.log(`stopping server ${result.right.argv.force ? "forcefully" : ""}`);
}
else if (result.right.command === "config") {
  if (result.right.subcommand === "get") {
    console.log(`getting config key ${result.right.argv.key ?? "all"}`);
  }
  else {
    console.log(
      `setting config key ${result.right.argv.key} to ${result.right.argv.value}`,
    );
  }
}

// or by using createHandlerFor:
const handler = createHandlerFor(cmd, {
  config: {
    get: ({ key, file, debug }) => {
      console.log(`getting config ${file} key ${key ?? "all"}`);
    },
    set: ({ key, value, file, debug }) => {
      console.log(`setting config ${file} key ${key} to ${value}`);
    },
  },
  start: ({ port, debug }) => {
    console.log(`starting server on port ${port}`);
  },
  stop: ({ force, debug }) => {
    console.log(`stopping server ${force ? "forcefully" : ""}`);
  },
});

handler.handle(result.right);
