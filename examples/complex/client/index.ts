import {
  comm,
  comp,
  composeHandlers,
  createHandlerFor,
  subs,
} from "../../../src";
import * as client from "./client";
import * as config from "./config";

export const cmd = comp(
  client.cmd,
  subs(
    comm(["config", "c"], "config management"),
    config.cmd,
  ),
);

export const handler = composeHandlers(
  client.handler,
  createHandlerFor(cmd.$.commands.config, config.handler),
);
