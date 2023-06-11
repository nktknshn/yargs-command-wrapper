import logging from "./common/logging";

export { GetCommandArgv } from "./command";
export type { GetCommandArgs } from "./command";
export { command, command as comm } from "./command/commands/basic/command";
export {
  composeCommands,
  composeCommands as comp,
} from "./command/commands/composed/compose-commands";
export {
  subs,
  subs as subcommands,
} from "./command/commands/with-subcommands/subs";
export * as Either from "./common/either";
export { composeHandlers, createHandlerFor } from "./handler";
export { HandlerFunctionFor } from "./handler/handler-function/type-handler-function-for";
export { failClient } from "./main";
export {
  buildAndParse,
  buildAndParseUnsafe,
  buildAndParseUnsafeR,
  parse,
} from "./parser/parser";

// logging.setLevel("DEBUG");
