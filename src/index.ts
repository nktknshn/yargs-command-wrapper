export { command, command as comm } from "./command/commands/basic/command";
export {
  composeCommands,
  composeCommands as comp,
} from "./command/commands/composed/compose-commands";
export { subs } from "./command/commands/with-subcommands/subs";

export { composeHandlers, createHandlerFor } from "./handler";

export * as Either from "./common/either";

export { failClient } from "./main";
export {
  build,
  buildAndParse,
  buildAndParseUnsafe,
  buildAndParseUnsafeR,
  parse,
} from "./parser/parser";

export type { GetCommandParseResult } from "./command/commands/type-parse-result";

export { GetCommandArgv, HandlerFunctionFor, subsHandlers } from "./handler";
