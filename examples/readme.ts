import {
  buildAndParse,
  comm,
  comp,
  createHandlerFor,
  Either,
  failClient,
  subs,
} from "../src";

const config = comp(
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

const server = comp(
  comm(
    ["start", "sta"],
    "start server",
    _ => _.option("port", { type: "number" }),
  ),
  comm(
    ["stop", "sto"],
    "stop server",
    _ => _.option("force", { type: "boolean", default: false }),
  ),
);

const cliCommand = comp(
  _ => _.option("debug", { type: "boolean", default: false }),
  server,
  subs(comm(["config", "c"], "config management"), config),
);

const { result, yargs } = buildAndParse(cliCommand, process.argv.slice(2));

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
    console.log(`getting config key ${result.right.argv.key}`);
  }
  else {
    console.log(
      `setting config key ${result.right.argv.key} to ${result.right.argv.value}`,
    );
  }
}

// or using createHandlerFor:
const handler = createHandlerFor(cliCommand, {
  config: createHandlerFor(cliCommand.commands[1], {
    get: (args) => {
      console.log(`getting config key ${args.key}`);
    },
    set: (args) => {
      console.log(`setting config key ${args.key} to ${args.value}`);
    },
  }),
  start: (args) => {
    console.log(`starting server on port ${args.port}`);
  },
  stop: (args) => {
    console.log(`stopping server ${args.force ? "forcefully" : ""}`);
  },
});

handler(result.right);