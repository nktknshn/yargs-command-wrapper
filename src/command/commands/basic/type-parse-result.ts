import { EmptyRecord } from "../../../common/types";
import { SelfHandlerKey } from "../../../handler/create-handler-for/type-create-handler-for";
import { CommandBasic } from "./type";

type GetCommandNameValue<C extends string> = C extends SelfHandlerKey
  ? undefined
  : C;

export type GetBasicCommandArgs<
  T extends CommandBasic = CommandBasic,
  TGlobalArgv = EmptyRecord,
> = T extends CommandBasic<infer C, infer R>
  ? { command: GetCommandNameValue<C>; argv: R & TGlobalArgv }
  : never;
