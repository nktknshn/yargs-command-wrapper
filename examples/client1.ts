import {
  addSubcommands,
  buildAndParse,
  command,
  composeCommands,
  Either,
  fail,
} from "../src";

import { createHandler, GetArgv, HandlerFor } from "../src/handler";

type SyncHandler<T> = (args: T) => void;
type AsyncHandler<T> = (args: T) => Promise<void>;
type Handler<T> = SyncHandler<T> | AsyncHandler<T>;

const h: SyncHandler<{}> = async () => {};

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
      _ => _.positional("address", { type: "string" }),
    ),
    command(
      "status",
      "get server status",
      _ => _.option("force", { type: "boolean" }),
    ),
    command(
      "stop",
      "stop server",
      _ => _.option("grateful", { type: "boolean", default: true }),
    ),
  );

  const startHandler = async (
    args: GetArgv<typeof cmd["commands"][0]>,
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

  const hs = {
    "start": async () => {},
    "stop": async () => {},
    "status": async () => {},
  };

  return {
    command: cmd,
    handler: createHandler(hs),
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

  const listHandler = async (
    argv: GetArgv<typeof commandList>,
  ): Promise<void> => {
  };

  const downloadHandler = async (
    argv: GetArgv<typeof commandDownload>,
  ) => {};

  const uploadHandler = async (
    argv: GetArgv<typeof commandUpload>,
  ) => {};

  // const handler2: HandlerFor<typeof cmd> = createHandlerFor(
  //   cmd,
  //   {
  //     download: ({ address, debug, files }) => {},
  //     list: listHandler,
  //     upload: uploadHandler,
  //   },
  // );

  // const a: (a: number) => void = (a: never) => {};
  // const b: (a: never) => void = (a: number) => {};

  const handler = createHandler({
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

  await handler(result.right);
}

main();
