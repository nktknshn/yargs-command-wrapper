import { comm, comp, composeHandlers, subs } from "../../../src";
import { createHandlerFor } from "../../../src/handler";
import { cmd as clientCommand } from "./args";
import * as config from "./config";
import { handler as clientHandler } from "./handler";

const configCommand = subs(
  comm("config", "config management"),
  config.cmd,
);

export const cmd = comp(clientCommand, configCommand);

export const handler = composeHandlers(
  clientHandler,
  createHandlerFor(configCommand, config.handler),
);
