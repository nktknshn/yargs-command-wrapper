import { Cast, FallbackNever, TupleKeys } from "../../../common/types-util";
import { Command } from "../command";
import { CommandArgs } from "../composed/type-command-args";
import { GetCommandParseResult } from "../type-parse-result";
import { CommandComposedWithSubcommands } from "./type";
import { PushCommand } from "./type-push-command";

export type GetSubcommandsParseResult<
  TCommands extends readonly Command[],
  TCommandName extends string,
  TArgv,
  TGlobalArgv = {},
> = FallbackNever<
  {
    [P in TupleKeys<TCommands>]: PushCommand<
      GetCommandParseResult<Cast<TCommands[P], Command>, TGlobalArgv>,
      TCommandName,
      TArgv
    >;
  }[TupleKeys<TCommands>],
  CommandArgs
>;

export type GetWithSubcommandsParseResult<
  T extends CommandComposedWithSubcommands,
  TGlobalArgv = {},
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
