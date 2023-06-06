import {
  buildAndParse,
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
  subs(["client", "c"], "client management", client.cmd),
  subs(["server", "s"], "server management", server.cmd),
);

const handler = createHandlerFor(cmd, {
  "client": client.handler,
  "server": server.handler,
});

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

main().catch(console.error);
