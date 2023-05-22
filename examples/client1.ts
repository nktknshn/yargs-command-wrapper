import {
  addSubcommands,
  build,
  buildAndParse,
  command,
  composeCommands,
  Either,
  GetCommandReturnType,
  parse,
} from "../src";

interface Address {
  address: string;
  port: number;
}

type PathToObject<TPath extends string, TPrefix extends string = ""> =
  TPath extends `/${infer TName}/${infer TRest}` ? 
      & Record<`${TPrefix}command`, TName>
      & PathToObject<`/${TRest}`, `sub${TPrefix}`>
    : {};

type Z = PathToObject<"/c/d/e/">;

type GetArgs<TArgs, TPath extends string> = TArgs extends unknown
  ? TArgs extends PathToObject<TPath> ? TArgs : never
  : never;

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

  const startHandler = (args: GetArgs<CommandArgs, "/start/">) => {
    // start server
  };

  const statusHandler = (args: GetArgs<CommandArgs, "/status/">) => {
    // show server status
  };

  const stopHandler = (args: GetArgs<CommandArgs, "/stop/">) => {
    // stop server
  };

  const handler = startHandler;

  return {
    command: cmd,
    handler,
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

  const listHandler = (args: GetArgs<CommandArgs, "/list/">) => {
  };

  return {
    command: cmd,
    handler: listHandler,
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
      command("main", "client management"),
      [addSubcommands(
        command("server", "server management"),
        serverCommand,
      )],
    ),
  );

  const { yargs, result } = buildAndParse(cmd);

  if (Either.isLeft(result)) {
    yargs.showHelp();
    console.error();
    console.error(result.left.message);
    process.exit(1);
  }

  if (result.right.command === "client") {
    result.right.subcommand;
    // clientHandler(result.right);
  }
  else if (result.right.command === "server") {
  }

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
