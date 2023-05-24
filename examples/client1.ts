import {
  addSubcommands,
  buildAndParse,
  command,
  composeCommands,
  createHandler,
  Either,
  fail,
  GetArgv,
} from "../src";
import { createHandlerFor } from "../src/handler";

interface Address {
  address: string;
  port: number;
}

function parseAddress(address: string): Address {
  const [addr, port] = address.split(":");
  if (port === undefined) {
    throw new Error(`invalid address: ${address}`);
  }
  return { address: addr, port: parseInt(port) };
}

function server() {
  const cmd = composeCommands(
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
  );

  const startHandler = async (
    args: GetArgv<typeof cmd["commands"][0]> & { debug: boolean },
  ) => {
    const address = args.address ?? { address: "0.0.0.0", port: 8080 };
    console.log(
      `start server at ${address.address}:${address.port}`,
    );
  };

  const statusHandler = async (
    args: GetArgv<typeof cmd["commands"][1]>,
  ) => {
    console.log(
      `get server status ${args.json ? "as json" : ""}`,
    );
  };

  const stopHandler = async (
    args: GetArgv<typeof cmd["commands"][2]>,
  ) => {
    console.log(
      `stop server ${args.grateful ? "gracefully" : "forcefully"}`,
    );
  };

  return {
    command: cmd,
    handler: createHandler({
      "start": startHandler,
      "status": statusHandler,
      "stop": stopHandler,
    }),
  };
}

function client() {
  const configCommand = composeCommands(
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

  const configHandler = createHandlerFor(configCommand, {
    "get": async (argv) => {
      console.log(
        `get config ${argv.key ?? "all"}`,
      );
    },
    "set": async (argv) => {
      console.log(
        `set config ${argv.key} ${argv.value}`,
      );
    },
  });

  const commandList = command(
    "list <address> [path]",
    "list files",
    _ =>
      _
        .positional("address", {
          type: "string",
          coerce: parseAddress,
          demandOption: true,
        })
        .positional("path", { type: "string", default: "/" }),
  );

  const commandDownload = command(
    "download <address> <files..>",
    "download files",
    _ =>
      _
        .positional("address", {
          type: "string",
          demandOption: true,
          coerce: parseAddress,
        })
        .positional("files", { type: "string", array: true }),
  );

  const commandUpload = command(
    "upload <address> <files..>",
    "upload files",
    _ =>
      _
        .positional("address", {
          type: "string",
          demandOption: true,
          coerce: parseAddress,
        })
        .positional("files", { type: "string", array: true }),
  );

  const cmd = composeCommands(
    _ => _.option("debug", { alias: "d", type: "boolean", default: false }),
    commandList,
    commandDownload,
    commandUpload,
    addSubcommands(
      command("config", "config management"),
      configCommand,
    ),
  );

  const listHandler = async (argv: GetArgv<typeof commandList>) => {
    console.log(
      `list ${argv.address.address}:${argv.address.port} at ${argv.path}`,
    );
  };

  const downloadHandler = async (argv: GetArgv<typeof commandDownload>) => {
    console.log(
      `download ${argv.address.address}:${argv.address.port} ${argv.files}`,
    );
  };

  const uploadHandler = async (argv: GetArgv<typeof commandUpload>) => {
    console.log(
      `upload ${argv.address.address}:${argv.address.port} ${argv.files}`,
    );
  };

  const handler = createHandler({
    "list": listHandler,
    "download": downloadHandler,
    "upload": uploadHandler,
    "config": configHandler,
  });

  return {
    command: cmd,
    handler,
  };
}

async function main() {
  const { command: clientCommand, handler: clientHandler } = client();
  const { command: serverCommand, handler: serverHandler } = server();

  const commandClient = addSubcommands(
    command("client", "client management"),
    clientCommand,
  );

  const commandServer = addSubcommands(
    command("server", "server management"),
    serverCommand,
  );

  const cmd = composeCommands(
    _ => _.option("debug", { alias: "d", type: "boolean", default: false }),
    commandClient,
    commandServer,
  );

  const handler = createHandler(
    { "client": clientHandler, "server": serverHandler },
  );

  const { yargs, result } = buildAndParse(cmd, process.argv.slice(2));

  if (Either.isLeft(result)) {
    fail(yargs, result);
  }

  if (result.right.argv.debug) {
    console.log(
      JSON.stringify(result.right, null, 2),
    );
  }

  await handler(result.right);
}

main();
