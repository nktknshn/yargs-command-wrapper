import {
  buildAndParse,
  comm,
  comp,
  Either,
  failClient,
  handlerFor2,
  subs,
} from "../src";

const cmd = comp(
  _ => _.option("debug", { type: "boolean", default: false }),
  subs(
    comm(["server", "s"], "server management"),
    [
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
      subs(
        comm(["config", "c"], "config management"),
        [
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
        ],
      ),
    ],
  ),
  subs(
    comm(["client", "c"], "client management"),
    [
      comm(["list", "l", "ls"], "list files", _ =>
        _.options({
          address: { type: "string", demandOption: true },
          path: { type: "string", default: "/" },
        })),
      comm(["download <files..>", "d"], "download files", _ =>
        _.options({
          address: { type: "string", demandOption: true },
          files: { type: "string", array: true },
        })),
      comm(["upload <files..>", "u"], "upload files", _ =>
        _.options({
          address: { type: "string", demandOption: true },
          files: { type: "string", array: true },
        })),
      subs(
        comm(["config", "c"], "config management"),
        [
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
        ],
      ),
    ],
  ),
);

const { result, yargs } = buildAndParse(cmd, process.argv.slice(2));

if (Either.isLeft(result)) {
  failClient(yargs, result);
}

if (result.right.argv.debug) {
  console.log("debug mode enabled");
}

// using helpers to handle commands
if (result.right.command === "client") {
  const clientCommand = cmd.commands[1];
  const configCommand = clientCommand.subcommands.commands[3];

  const configHandler = handlerFor2(
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

  const clientHandler = handlerFor2(
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

  // clientHandler({
  //   command: "client",
  //   subcommand: "config",
  //   subsubcommand: "set",
  //   argv: { key: "foo", value: "bar" },
  // });

  // handle parsed arguments
  clientHandler.handle(result.right);
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
