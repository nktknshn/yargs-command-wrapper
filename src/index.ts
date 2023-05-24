export {
  command as comm,
  command as command,
  composeCommands as comp,
  composeCommands as compose,
  subs,
} from "./builder";

export * as Either from "./either";
export { failClient } from "./helpers";
export {
  build,
  buildAndParse,
  buildAndParseUnsafe,
  buildAndParseUnsafeR,
  parse,
} from "./parser";
export type { GetCommandReturnType } from "./types";

export { composeHandlers, GetArgv, HandlerFor } from "./handler";

export { createHandlerFor } from "./create-handler-for";
