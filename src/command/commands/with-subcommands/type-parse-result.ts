import { EmptyRecord } from "../../../common/types";
import { Cast, FallbackNever, TupleKeys } from "../../../common/types-util";
import { NestedCommandArgs } from "../args/type-nested-command-args";
import { PushCommand } from "../args/type-push-command";
import { Command } from "../command";
import { GetCommandArgs } from "../type-parse-result";
import { CommandComposedWithSubcommands } from "./type";

export type GetSubcommandsParseResult<
  TCommands extends readonly Command[],
  TCommandName extends string,
  TArgv,
  TGlobalArgv = EmptyRecord,
> = {
  [P in TupleKeys<TCommands>]: PushCommand<
    GetCommandArgs<Cast<TCommands[P], Command>, TGlobalArgv>,
    TCommandName,
    TArgv
  >;
}[TupleKeys<TCommands>];

type GetSelfArgs<T extends CommandComposedWithSubcommands, B extends boolean> =
  [B] extends [true] ? GetCommandArgs<T["command"]>
    : never;

export type GetSubcommandsArgs<
  T extends CommandComposedWithSubcommands,
  TGlobalArgv = EmptyRecord,
> = T extends CommandComposedWithSubcommands<
  infer TCommandName,
  infer TCommands,
  infer TCommandArgv,
  infer TComposedArgv,
  infer TProps
> ? FallbackNever<
    GetSubcommandsParseResult<
      TCommands,
      TCommandName,
      TCommandArgv & TComposedArgv,
      TGlobalArgv
    > | GetSelfArgs<T, TProps["selfHandle"]>,
    NestedCommandArgs
  >
  : never;
