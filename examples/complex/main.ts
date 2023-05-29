import {
  buildAndParse,
  comm,
  compose,
  Either,
  failClient,
  subs,
  subsHandlers,
} from "../../src";

import * as client from "./client";
import * as server from "./server";

const cmd = compose(
  _ => _.option("debug", { alias: "d", type: "boolean", default: false }),
  subs(comm("client", "client management"), client.cmd),
  subs(comm("server", "server management"), server.cmd),
);

const handler = subsHandlers({
  "client": client.handler.handle,
  "server": server.handler.handle,
});

// handler can be used directly:
// handler({
//   command: "client",
//   subcommand: "list",
//   argv: {
//     address: { address: "localhost", port: 8080 },
//     path: "/",
//     debug: true,
//   },
// });

async function main() {
  const { yargs, result } = buildAndParse(cmd, process.argv.slice(2));

  if (Either.isLeft(result)) {
    failClient(yargs, result);
  }

  if (result.right.argv.debug) {
    console.log(
      JSON.stringify(result.right, null, 2),
    );
  }

  await handler(result.right);
}

main();
