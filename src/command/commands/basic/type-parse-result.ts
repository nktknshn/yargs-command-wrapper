import { CommandBasic } from "./type";

export type GetBasicParseResult<
  T extends CommandBasic<string, {}> = CommandBasic<string, {}>,
  TGlobalArgv = {},
> = T extends CommandBasic<infer C, infer R>
  ? { command: C; argv: R & TGlobalArgv }
  : never;
