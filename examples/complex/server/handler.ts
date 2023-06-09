/* eslint-disable @typescript-eslint/require-await */
import { createHandlerFor } from "../../../src";
import { cmd } from "./args";
import { HandlerResult } from "./types";

export const handler = createHandlerFor(
  cmd,
  (args): HandlerResult => async ({ yargs }) => {
    if (args.argv.debug) {
      console.log("debug mode");
    }
    if (args.command === undefined) {
      yargs.showHelp();
    }
    else if (args.command === "start") {
      const address = args.argv.address ?? { address: "0.0.0.0", port: 8080 };
      console.log(
        `start server at ${address.address}:${address.port}`,
      );
    }
    else if (args.command === "status") {
      console.log(
        `get server status ${args.argv.json ? "as json" : ""}`,
      );
    }
    else if (args.command === "stop") {
      console.log(
        `stop server ${args.argv.grateful ? "gracefully" : "forcefully"}`,
      );
    }
    else if (args.command === "config") {
      if (args.subcommand === "get") {
        console.log(
          `get config value ${args.argv.key ?? "all"} from ${args.argv.file}`,
        );
      }
      else if (args.subcommand === "set") {
        console.log(
          `set config value ${args.argv.key} to ${args.argv.value} in ${args.argv.file}`,
        );
      }
    }

    return;
  },
);
