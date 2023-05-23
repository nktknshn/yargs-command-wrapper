import {
  addSubcommands,
  build,
  buildAndParse,
  command,
  composeCommands,
  Either,
  fail,
  GetCommandReturnType,
  parse,
} from "../src";
import { createHandler, GetArgs, Handler } from "../src/handler";
import { ToUnion, TupleToUnion } from "../src/util";

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

  type CommandArgs = GetCommandReturnType<typeof cmd>;

  const startHandler: Handler<GetArgs<CommandArgs, "/start/">["argv"]> = (
    args,
  ) => {
    // start servers
  };

  const statusHandler: Handler<GetArgs<CommandArgs, "/status/">["argv"]> = (
    args,
  ) => {
    // show server status
  };

  const stopHandler: Handler<GetArgs<CommandArgs, "/stop/">["argv"]> = (
    args,
  ) => {
    // stop server
  };

  return {
    command: cmd,
    handler: createHandler(
      {
        "start": startHandler,
        "stop": stopHandler,
        "status": statusHandler,
      },
    ),
  };
}

function client() {
  const cmd = composeCommands(
    _ => _.option("debug", { alias: "d", type: "boolean", default: false }),
    command(
      "list <address> [path[",
      "list files",
      _ =>
        _
          .positional("address", { type: "string", demandOption: true })
          .positional("path", { type: "string", default: "/" }),
    ),
    command(
      "download <address> <files..>",
      "download files",
      _ =>
        _
          .positional("address", { type: "string", demandOption: true })
          .positional("files", { type: "string", array: true }),
    ),
    command(
      "upload <address> <files..>",
      "upload files",
      _ =>
        _
          .positional("address", { type: "string", demandOption: true })
          .positional("files", { type: "string", array: true }),
    ),
  );

  type CommandArgs = GetCommandReturnType<typeof cmd>;

  const listHandler: Handler<GetArgs<CommandArgs, "/list/">["argv"]> = (
    argv,
  ) => {
  };

  const downloadHandler: Handler<GetArgs<CommandArgs, "/download/">["argv"]> = (
    argv,
  ) => {};

  const uploadHandler: Handler<GetArgs<CommandArgs, "/upload/">["argv"]> = (
    argv,
  ) => {};

  // createCommandHandler
  /*
  const handler = createCommandHandler(
    cmd,
    {
      "list": (argv) => {},
      "download": (argv) => {},
      "upload": (argv) => {},
    }
  )
  */
  const handler = createHandler(
    {
      "list": listHandler,
      "download": downloadHandler,
      "upload": uploadHandler,
    },
  );

  handler({
    command: "list",
    argv: { address: "localhost", path: "/", debug: true },
  });

  return {
    command: cmd,
    handler,
  };
}

async function main() {
  const { command: clientCommand, handler: clientHandler } = client();
  const { command: serverCommand, handler: serverHandler } = server();

  const cmd = composeCommands(
    addSubcommands(
      command("client", "client management"),
      clientCommand,
    ),
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

  handler({
    command: "server",
    subcommand: "start",
    argv: {
      // address: "localhost",
      // path: "/",
      items: [],
      debug: true,
    },
    // command: "client",
    // subcommand: "start",
  });

  const { yargs, result } = buildAndParse(cmd);

  if (Either.isLeft(result)) {
    fail(yargs, result);
  }

  handler(result.right);

  // if (result.right.command === "client") {
  //   result.right.subcommand;
  //   // clientHandler(result.right);
  // }
  // else if (result.right.command === "server") {
  //   serverHandler({
  //     command: "start",
  //   });
  // }

  // if (result.right.command === "get") {
  //   console.log(result.right.argv.items);
  //   console.log(result.right.argv.debug);
  // }
  // else if (result.right.command === "create") {
  // }
  // else if (result.right.command === "list") {
  // }
}

main();
