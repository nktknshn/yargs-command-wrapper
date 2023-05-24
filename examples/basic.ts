import {
  addSubcommands,
  buildAndParse,
  command,
  composeCommands,
  createHandlerFor,
  Either,
  fail,
} from "../src";

const cmd = composeCommands(
  _ => _.option("debug", { type: "boolean", default: false }),
  addSubcommands(
    command(["server", "s"], "server management"),
    [
      command(
        ["start", "sta"],
        "start server",
        _ => _.option("port", { type: "number" }),
      ),
      command(
        ["stop", "sto"],
        "stop server",
        _ => _.option("force", { type: "boolean", default: false }),
      ),
      addSubcommands(
        command(["config", "c"], "config management"),
        [
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
        ],
      ),
    ],
  ),
  addSubcommands(
    command(["client", "c"], "client management"),
    [
      command(["list", "l", "ls"], "list files", _ =>
        _.options({
          address: { type: "string", demandOption: true },
          path: { type: "string", default: "/" },
        })),
      command(["download <files..>", "d"], "download files", _ =>
        _.options({
          address: { type: "string", demandOption: true },
          files: { type: "string", array: true },
        })),
      command(["upload <files..>", "u"], "upload files", _ =>
        _.options({
          address: { type: "string", demandOption: true },
          files: { type: "string", array: true },
        })),
      addSubcommands(
        command(["config", "c"], "config management"),
        [
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
        ],
      ),
    ],
  ),
);

const { result, yargs } = buildAndParse(cmd, process.argv.slice(2));

if (Either.isLeft(result)) {
  fail(yargs, result);
}

if (result.right.argv.debug) {
  console.log("debug mode enabled");
}

// using helpers to handle commands
if (result.right.command === "client") {
  const clientCommand = cmd.commands[1];
  const configCommand = clientCommand.subcommands.commands[3];

  const configHandler = createHandlerFor(
    configCommand,
    {
      "get": async ({ key }) => {
        console.log(`get config ${key ?? "all"}`);
      },
      "set": async ({ key, value }) => {
        console.log(`set config ${key} ${value}`);
      },
    },
  );

  // `configHandler` can be used directly, e.g.:
  //   configHandler({
  //     command: "config",
  //     subcommand: "set",
  //     argv: { key: "foo", value: "bar" },
  //   });

  const clientHandler = createHandlerFor(
    clientCommand,
    {
      "list": async ({ address, path }) => {
        console.log(`list ${address} ${path}`);
      },
      "download": async ({ address, files }) => {
        console.log(`download ${address} ${files}`);
      },
      "upload": async ({ address, files }) => {
        console.log(`upload ${address} ${files}`);
      },
      "config": configHandler,
    },
  );

  // handle parsed arguments
  clientHandler(result.right);
}

// or handle parsed arguments manually
switch (result.right.command) {
  case "server":
    switch (result.right.subcommand) {
      case "start":
        console.log(
          `Start server on port ${result.right.argv.port ?? 8080}`,
        );
        break;
      case "stop":
        console.log(
          `Stop server ${result.right.argv.force ? "forcefully" : ""}`,
        );
        break;
      case "config":
        switch (result.right.subsubcommand) {
          case "get":
            console.log(
              `List server config ${result.right.subsubcommand} ${result.right.argv.key}`,
            );
            break;
          case "set":
            console.log(
              `Update server config ${result.right.subsubcommand} ${result.right.argv.key} ${result.right.argv.value}`,
            );
            break;
        }
    }
    break;
}
