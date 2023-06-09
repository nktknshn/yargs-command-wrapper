import { EmptyRecord } from "../../../common/types";
import { Cast, FallbackNever, TupleKeys } from "../../../common/types-util";
import { NestedCommandArgs } from "../args/type-nested-command-args";
import { PushCommand } from "../args/type-push-command";
import { Command } from "../command";
import { ComposedProps } from "../composed/type-command-composed";
import { ComposedSelfArgs } from "../composed/type-parse-result";
import { GetCommandArgs } from "../type-parse-result";
import { CommandComposedWithSubcommands } from "./type";

type GetSubcommandsParseResult<
  TCommands extends readonly Command[],
  TCommandName extends string,
  TArgv extends EmptyRecord,
  TGlobalArgv extends EmptyRecord = EmptyRecord,
  TComposedProps extends ComposedProps = ComposedProps,
> =
  | {
    [P in TupleKeys<TCommands>]: PushCommand<
      GetCommandArgs<Cast<TCommands[P], Command>, TGlobalArgv>,
      TCommandName,
      TArgv
    >;
  }[TupleKeys<TCommands>]
  | PushCommand<
    ComposedSelfArgs<TComposedProps, TArgv>,
    TCommandName,
    TGlobalArgv
  >;

type GetSelfArgs<T extends CommandComposedWithSubcommands, B extends boolean> =
  [B] extends [true] ? GetCommandArgs<T["command"]>
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
      TGlobalArgv,
      TComposedProps
    >
    | GetSelfArgs<T, TProps["selfHandle"]>,
    NestedCommandArgs
  >
  : never;
