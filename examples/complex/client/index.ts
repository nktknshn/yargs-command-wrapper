import { comp, composeHandlers, createHandlerFor, subs } from "../../../src";

import * as client from "./client";
import * as config from "./config";

export const cmd = comp(
  client.cmd,
  subs(["config", "c"], "config management", config.cmd).selfHandle(true),
);

const configSubHandler = composeHandlers(
  config.handler,
  createHandlerFor(cmd.$.config.$.$self, (args) => {
    console.log(`Config management`);
  }),
);

export const handler = composeHandlers(
  client.handler,
  configSubHandler,
);
