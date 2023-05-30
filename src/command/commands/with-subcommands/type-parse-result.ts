import { Cast, FallbackNever, TupleKeys } from "../../../common/types-util";
import { CommandArgs } from "../../../handler";
import { Command } from "../command";
import { GetCommandParseResult } from "../type-parse-result";
import { CommandWithSubcommands } from "./type";
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
  T extends CommandWithSubcommands,
  TGlobalArgv = {},
> = T extends CommandWithSubcommands<
  infer TCommandName,
  infer TCommands,
  infer TCommandArgv
>
  ? GetSubcommandsParseResult<
    TCommands,
    TCommandName,
    TCommandArgv,
    TGlobalArgv
  >
  : never;
