/* eslint-disable @typescript-eslint/require-await */
import { comp, composeHandlers, createHandlerFor, subs } from "../../../src";

import * as client from "./client";
import * as config from "./config";
import { HandlerResult } from "./types";

export const cmd = comp(
  subs(["config", "c"], "config management", config.cmd).selfHandle(true),
  client.cmd,
);

const configSubHandler = createHandlerFor(
  cmd.$.config,
  composeHandlers(
    config.handler,
    // extend config handler with self handler
    createHandlerFor(
      cmd.$.config.$.$self,
      (argv): HandlerResult => async ({ yargs }) => {
        console.log(`Config management: ${argv.configFile}`);
        console.log();

        yargs.showHelp();
      },
    ),
  ),
);

export const handler = composeHandlers(
  client.handler,
  configSubHandler,
);
