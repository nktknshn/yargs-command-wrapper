import {
  Command,
  CommandBasic,
  CommandComposed,
  CommandComposedWithSubcommands,
} from "../../command";
import { GetCommandParseResult, GetComposedParseResult } from "../../command";
import {
  GetCommandName,
  GetComposedCommandsNames,
} from "../../command/commands/composed/type-helpers";
import { EmptyRecord } from "../../common/types";
import { Cast, FallbackType, ToList } from "../../common/types-util";
import { HandlerSyncType } from "../handler-function/type";
import { ComposableHandler } from "./type";

// type A = Fallback<[string], [], 1>

/**
 * @description Gets the type of a composable handler for the given command
 */
export type ComposableHandlerFor<
  TCommand extends Command,
  TSyncType extends HandlerSyncType = HandlerSyncType,
  TReturn = unknown,
  TGlobalArgv extends EmptyRecord = EmptyRecord,
> = TCommand extends CommandBasic ? ComposableHandler<
    [TCommand["commandName"]],
    GetCommandParseResult<TCommand, TGlobalArgv>,
    TSyncType,
    TReturn
  >
  : TCommand extends CommandComposed ? ComposableHandler<
      FallbackType<
        Cast<ToList<GetComposedCommandsNames<TCommand>>, readonly string[]>,
        [],
        string[]
      >,
      GetComposedParseResult<TCommand, TGlobalArgv>,
      TSyncType,
      TReturn
    >
  : TCommand extends CommandComposedWithSubcommands ? ComposableHandler<
      [GetCommandName<TCommand>],
      GetCommandParseResult<TCommand, TGlobalArgv>,
      TSyncType,
      TReturn
    >
  : never;
