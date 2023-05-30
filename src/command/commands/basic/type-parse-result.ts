import { BasicCommand } from "./type";

export type GetBasicParseResult<
  T extends BasicCommand<string, {}> = BasicCommand<string, {}>,
  TGlobalArgv = {},
> = T extends BasicCommand<infer C, infer R>
  ? { command: C; argv: R & TGlobalArgv }
  : never;
