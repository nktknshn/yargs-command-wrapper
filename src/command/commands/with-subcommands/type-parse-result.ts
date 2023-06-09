import { EmptyRecord } from "../../../common/types";
import { Cast, FallbackNever, TupleKeys } from "../../../common/types-util";
import { NestedCommandArgs } from "../args/type-nested-command-args";
import { PushCommand } from "../args/type-push-command";
import { Command } from "../command";
import { ComposedProps } from "../composed/type-command-composed";
import { ComposedSelfArgs } from "../composed/type-parse-result";
import { GetCommandArgs } from "../type-parse-result";
import { CommandComposedWithSubcommands } from "./type";

export type GetSubcommandsParseResult<
  TCommands extends readonly Command[],
  TCommandName extends string,
  TArgv extends EmptyRecord,
  TGlobalArgv extends EmptyRecord = EmptyRecord,
> = {
  [P in TupleKeys<TCommands>]: PushCommand<
    GetCommandArgs<Cast<TCommands[P], Command>, TGlobalArgv>,
    TCommandName,
    TArgv
  >;
}[TupleKeys<TCommands>];

export type GetSubsSelfArgs<T extends CommandComposedWithSubcommands> =
  T extends CommandComposedWithSubcommands<
    infer TCommandName,
    infer TCommands,
    infer TCommandArgv,
    infer TComposedArgv,
    infer TProps,
    infer TComposedProps
  > ? TProps["selfHandle"] extends true ? GetCommandArgs<T["command"]> : never
    : never;
// [T['props']['selfHandle']] extends [true] ? GetCommandArgs<T["command"]>
//   : never;

// dprint-ignore
export type GetSubcommandsArgs<
  T extends CommandComposedWithSubcommands,
  TGlobalArgv extends EmptyRecord = EmptyRecord,
> = T extends CommandComposedWithSubcommands<
  infer TCommandName,
  infer TCommands,
  infer TCommandArgv,
  infer TComposedArgv,
  infer TProps,
  infer TComposedProps
> ? FallbackNever<
    | GetSubcommandsParseResult<
      TCommands,
      TCommandName,
      TCommandArgv & TComposedArgv,
      TGlobalArgv
    >
    // add composed self handle argument { command: TCommandName, subcommand: "" }
    | PushCommand<
      ComposedSelfArgs<TComposedProps, TCommandArgv & TComposedArgv>,
      TCommandName,
      TGlobalArgv
    >
    // add subs self handle argument { command: TCommandName }
    | GetSubsSelfArgs<T>
    , NestedCommandArgs
  >
  : never;
