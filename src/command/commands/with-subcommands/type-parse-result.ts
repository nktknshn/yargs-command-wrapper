import { EmptyRecord } from "../../../common/types";
import { Cast, FallbackNever, TupleKeys } from "../../../common/types-util";
import { NestedCommandArgs } from "../args/type-nested-command-args";
import { Command } from "../command";
import { GetCommandArgs } from "../type-parse-result";
import { CommandComposedWithSubcommands } from "./type";
import { PushCommand } from "./type-push-command";

export type GetSubcommandsParseResult<
  TCommands extends readonly Command[],
  TCommandName extends string,
  TArgv,
  TGlobalArgv = EmptyRecord,
> = FallbackNever<
  {
    [P in TupleKeys<TCommands>]: PushCommand<
      GetCommandArgs<Cast<TCommands[P], Command>, TGlobalArgv>,
      TCommandName,
      TArgv
    >;
  }[TupleKeys<TCommands>],
  NestedCommandArgs
>;

export type GetWithSubcommandsArgs<
  T extends CommandComposedWithSubcommands,
  TGlobalArgv = EmptyRecord,
> = T extends CommandComposedWithSubcommands<
  infer TCommandName,
  infer TCommands,
  infer TCommandArgv
> ? GetSubcommandsParseResult<
    TCommands,
    TCommandName,
    TCommandArgv,
    TGlobalArgv
  >
  : never;
