import {
  addSubcommands,
  buildAndParse,
  command,
  composeCommands,
  Either,
  fail,
} from "../src";

import { createHandler, createHandlerFor, HandlerFor } from "../src/handler";

interface Address {
  address: string;
  port: number;
}

function server() {
  const cmd = composeCommands(
    _ => _.option("debug", { alias: "d", type: "boolean", default: false }),
    command(
      "start",
      "start server",
      _ => _.positional("items", { array: true, type: "string" }),
    ),
    command("status", "get server status"),
    command("stop", "stop server"),
  );

  const startHandler: HandlerFor<typeof cmd["commands"][0]> = (
    args,
  ) => {
    // start servers
  };

  const statusHandler: HandlerFor<typeof cmd["commands"][1]> = (
    args,
  ) => {
    // show server status
  };

  const stopHandler: HandlerFor<typeof cmd["commands"][2]> = (
    args,
  ) => {
    // stop server
  };

  // const h: HandlerFor<typeof cmd> = createHandler({
  //   "start": (args: {}) => {},
  //   "stop": stopHandler,
  //   "status": statusHandler,
  // });

  return {
    command: cmd,
    handler: createHandler({
      "start": startHandler,
      "stop": stopHandler,
      "status": statusHandler,
    }),
  };
}

function client() {
  const commandList = command(
    "list <address> [path[",
    "list files",
    _ =>
      _
        .positional("address", { type: "string", demandOption: true })
        .positional("path", { type: "string", default: "/" }),
  );

  const commandDownload = command(
    "download <address> <files..>",
    "download files",
    _ =>
      _
        .positional("address", { type: "string", demandOption: true })
        .positional("files", { type: "string", array: true }),
  );

  const commandUpload = command(
    "upload <address> <files..>",
    "upload files",
    _ =>
      _
        .positional("address", { type: "string", demandOption: true })
        .positional("files", { type: "string", array: true }),
  );

  const cmd = composeCommands(
    _ => _.option("debug", { alias: "d", type: "boolean", default: false }),
    commandList,
    commandDownload,
    commandUpload,
  );

  const listHandler: HandlerFor<typeof commandList> = (argv) => {
  };

  const downloadHandler: HandlerFor<typeof commandDownload> = (
    argv,
  ) => {};

  const uploadHandler: HandlerFor<typeof commandUpload> = (
    argv,
  ) => {};

  const handler2: HandlerFor<typeof cmd> = createHandlerFor(
    cmd,
    {
      download: ({ address, debug, files }) => {},
      list: listHandler,
      upload: uploadHandler,
    },
  );

  // const a: (a: number) => void = (a: never) => {};
  // const b: (a: never) => void = (a: number) => {};

  const handler: HandlerFor<typeof cmd> = createHandler({
    "list": listHandler,
    "download": downloadHandler,
    "upload": uploadHandler,
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

  const cmd = composeCommands(
    commandClient,
    addSubcommands(
      command("server", "server management"),
      serverCommand,
    ),
    // addSubcommands(
    //   command("main", "client management"),
    //   [addSubcommands(
    //     command("server", "server management"),
    //     serverCommand,
    //   )],
    // ),
  );

  const handler = createHandler(
    { "client": clientHandler, "server": serverHandler },
  );

  const { yargs, result } = buildAndParse(commandClient);

  if (Either.isLeft(result)) {
    fail(yargs, result);
  }

  handler(result.right);
}

main();
