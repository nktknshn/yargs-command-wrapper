/* eslint-disable @typescript-eslint/require-await */
import {
  buildAndParse,
  comm,
  comp,
  createHandlerFor,
  Either,
  failClient,
  subs,
} from "../src";

const cmd = comp(
  _ => _.option("debug", { alias: "d", type: "boolean", default: false }),
  subs(
    ["server", "s"],
    "server management",
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
        ["config", "c"],
        "config management",
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
    // the server command will be valid without a subcommand
  ).selfHandle(true),
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
          files: { type: "string", array: true, demandOption: true },
        })),
      comm(["upload <files..>", "u"], "upload files", _ =>
        _.options({
          address: { type: "string", demandOption: true },
          files: { type: "string", array: true, demandOption: true },
        })),
      subs(
        ["config", "c"],
        "config management",
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
    // the client command will be valid without a subcommand
  ).selfHandle(true),
);

const { result, yargs } = buildAndParse(cmd);

if (Either.isLeft(result)) {
  failClient(yargs, result);
}

if (result.right.argv.debug) {
  console.log("debug mode enabled");
}

// using helpers to handle commands
if (result.right.command === "client") {
  const clientCommand = cmd.$.client;

  const configHandler = createHandlerFor(
    clientCommand.$.config,
    {
      "get": async ({ key }) => {
        console.log(`get config ${key ?? "all"}`);
      },
      "set": async ({ key, value }) => {
        console.log(`set config ${key} ${value}`);
      },
    },
  );

  const clientHandler = createHandlerFor(
    cmd.$.client,
    {
      "$self": async ({ debug }) => {
        // handle client command without subcommand
        console.log(`Client managements ${debug ? "with" : "without"} debug`);
        yargs.showHelp();
      },
      "list": async ({ address, path }) => {
        console.log(`list ${address} ${path}`);
      },
      "download": async ({ address, files }) => {
        console.log(`download ${address} ${files.join(", ")}`);
      },
      "upload": async ({ address, files }) => {
        console.log(`upload ${address} ${files.join(", ")}`);
      },
      "config": configHandler,
    },
  );

  // handle parsed arguments
  clientHandler.handle(result.right).catch(console.error);
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
              `List server config ${result.right.argv.key ?? "all"}`,
            );
            break;
          case "set":
            console.log(
              `Update server config ${result.right.argv.key} ${result.right.argv.value}`,
            );
            break;
        }
        break;
      case undefined:
        // handle server command without subcommand
        console.log(
          `Server management ${
            result.right.argv.debug ? "with" : "without"
          } debug`,
        );
        yargs.showHelp();
        break;
    }
    break;
}
