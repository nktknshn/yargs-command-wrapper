import {
  buildAndParse,
  comm,
  comp,
  createHandlerFor,
  Either,
  failClient,
  subs,
} from "../../src";

import * as client from "./client";
import * as server from "./server";

const cmd = comp(
  _ => _.option("debug", { alias: "d", type: "boolean", default: false }),
  subs(comm(["client", "c"], "client management"), client.cmd),
  subs(comm(["server", "s"], "server management"), server.cmd),
);

const handler = createHandlerFor(cmd, {
  "client": client.handler,
  "server": server.handler,
});

/*
handler can be used directly:
handler.handle({
  command: "client",
  subcommand: "list",
  argv: {
    address: { address: "localhost", port: 8080 },
    path: "/",
    debug: true,
  },
});
*/

async function main() {
  const { yargs, result } = buildAndParse(cmd);

  if (Either.isLeft(result)) {
    failClient(yargs, result);
  }

  if (result.right.argv.debug) {
    console.log(
      JSON.stringify(result.right, null, 2),
    );
  }

  await handler.handle(result.right);
}

main();
