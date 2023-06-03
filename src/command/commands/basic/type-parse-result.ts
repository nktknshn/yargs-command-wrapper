import { EmptyRecord } from "../../../common/types";
import { CommandBasic } from "./type";

export type GetBasicParseResult<
  T extends CommandBasic = CommandBasic,
  TGlobalArgv = EmptyRecord,
> = T extends CommandBasic<infer C, infer R>
  ? { command: C; argv: R & TGlobalArgv }
  : never;
