# About

<p>
  <a href="https://github.com/nktknshn/yargs-command-wrapper/actions">
    <img src="https://github.com/nktknshn/yargs-command-wrapper/actions/workflows/node.js.yml/badge.svg?branch=master" alt="build status" height="20">
  </a>
  <a href="https://www.npmjs.com/package/yargs-command-wrapper">
    <img src="https://img.shields.io/npm/v/yargs-command-wrapper.svg" alt="npm link" height="20">
  </a>
</p>

This wrapper enables the parsing of commands and subcommands into a unified set
of types that can be handled independently. Additionally, it simplifies the process
of creating a handler for these commands

The inferred union type of the parsed arguments is as follows:

<!-- dprint-ignore -->
```typescript
type ParsedArgs = 
| { command: "server"; subcommand: "start"; argv: { port: number; } }
| { command: "client"; subcommand: "connect"; argv: { host: string; port: number; } }
| { command: "client"; subcommand: "config"; subsubcommand: "get"; argv: { key?: string; file: string; } }
| { command: "client"; subcommand: "config"; subsubcommand: "set"; argv: { key: string; value: string; file: string; } }
```

# Installation

```bash
npm install --save yargs-command-wrapper
```

# Example

**API might change in the future.**

```typescript
import {
  buildAndParse,
  command,
  composeCommands,
  createHandlerFor,
  Either,
  failClient,
  subcommands,
} from "yargs-command-wrapper";

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

const cmd = composeCommands(
  _ => _.option("debug", { alias: "d", type: "boolean", default: false }),
  serverStart,
  serverStop,
  subcommands(["config", "c"], "config management", config),
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
```
