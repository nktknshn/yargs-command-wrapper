import { CommandArgs } from "../../../test/test-try-handler";
import {
  Command,
  CommandBasic,
  CommandComposed,
  CommandComposedWithSubcommands,
} from "../../command";
import { GetCommandParseResult, GetComposedParseResult } from "../../command";
import { NestedCommandArgs } from "../../command/commands/args/type-nested-command-args";
import {
  GetCommandName,
  GetComposedCommandsNames,
} from "../../command/commands/composed/type-helpers";
import { EmptyRecord } from "../../common/types";
import { Cast, Equal, FallbackType, ToList } from "../../common/types-util";
import { HandlerSyncType } from "../handler-function/type";
import { ComposableHandler } from "./type";

/**
 * @description Gets the type of a composable handler for the given command
 */
export type ComposableHandlerFor<
  TCommand extends Command,
  TSyncType extends HandlerSyncType = HandlerSyncType,
  TReturn = unknown,
  TGlobalArgv extends EmptyRecord = EmptyRecord,
> = TCommand extends CommandBasic
  ? Equal<TCommand, CommandBasic> extends true
    ? ComposableHandler<[string], CommandArgs<never, never>, TSyncType, TReturn>
  : ComposableHandler<
    [TCommand["commandName"]],
    GetCommandParseResult<TCommand, TGlobalArgv>,
    TSyncType,
    TReturn
  >
  : TCommand extends CommandComposed
    ? Equal<TCommand, CommandComposed> extends true ? ComposableHandler<
        readonly string[],
        CommandArgs<never, never>,
        TSyncType,
        TReturn
      >
    : ComposableHandler<
      FallbackType<
        Cast<ToList<GetComposedCommandsNames<TCommand>>, readonly string[]>,
        [],
        string[]
      >,
      GetComposedParseResult<TCommand, TGlobalArgv>,
      TSyncType,
      TReturn
    >
  : TCommand extends CommandComposedWithSubcommands
    ? Equal<TCommand, CommandComposedWithSubcommands> extends true
      ? ComposableHandler<
        [string],
        NestedCommandArgs<never, never, never>,
        TSyncType,
        TReturn
      >
    : ComposableHandler<
      [GetCommandName<TCommand>],
      GetCommandParseResult<TCommand, TGlobalArgv>,
      TSyncType,
      TReturn
    >
  : never;
