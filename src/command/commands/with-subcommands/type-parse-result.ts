import { EmptyRecord } from "../../../common/types";
import { Cast, FallbackNever, TupleKeys } from "../../../common/types-util";
import { NestedCommandArgs } from "../args/type-nested-command-args";
import { PushCommand } from "../args/type-push-command";
import { Command } from "../command";
import { ComposedProps } from "../composed/type-command-composed";
import { GetCommandsNames } from "../composed/type-helpers";
import { ComposedSelfArgs } from "../composed/type-parse-result";
import { IsSelfHandled } from "../type-helpers";
import { GetCommandArgs } from "../type-parse-result";
import { CommandComposedWithSubcommands } from "./type-subs";

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

export type GetSubsSelfArgs<
  T extends CommandComposedWithSubcommands,
  TGlobalArgv extends EmptyRecord = EmptyRecord,
> = T extends CommandComposedWithSubcommands<
  infer TCommandName,
  infer TCommands,
  infer TCommandArgv,
  infer TComposedArgv,
  infer TProps,
  infer TComposedProps
>
  ? TProps["selfHandle"] extends true
    ? NestedCommandArgs<TCommandArgv & TGlobalArgv, TCommandName, undefined>
  : never
  : never;

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
    // add inner composed self handle argument { command: TCommandName, subcommand: "" }
    // | PushCommand<
    //   ComposedSelfArgs<TComposedProps, TCommandArgv & TComposedArgv>,
    //   TCommandName,
    //   TGlobalArgv
    // >
    | (IsSelfHandled<TComposedProps> extends true
      ? NestedCommandArgs<TCommandArgv & TGlobalArgv, TCommandName, undefined>
      : never)
    // add subs self handle argument { command: TCommandName; subcommand: undefined }
    | (IsSelfHandled<TProps> extends true
      ? NestedCommandArgs<TCommandArgv & TGlobalArgv, TCommandName, undefined>
      : never),
    NestedCommandArgs
  >
  : never;
