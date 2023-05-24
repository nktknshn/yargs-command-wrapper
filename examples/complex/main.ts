import {
  addSubcommands,
  buildAndParse,
  command,
  composeCommands,
  createHandler,
  Either,
  fail,
} from "../../src";

import * as client from "./client";
import * as server from "./server";

const cmd = composeCommands(
  _ => _.option("debug", { alias: "d", type: "boolean", default: false }),
  addSubcommands(command("client", "client management"), client.cmd),
  addSubcommands(command("server", "server management"), server.cmd),
);

const handler = createHandler({
  "client": client.handler,
  "server": server.handler,
});

async function main() {
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
