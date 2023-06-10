import {
  Command,
  CommandBasic,
  CommandComposed,
  CommandComposedWithSubcommands,
  GetCommandArgs,
  GetComposedParseResult,
} from "../../command";
import {
  GetCommandName,
  GetComposedCommandsNames,
  GetComposedCommandsNamesList,
} from "../../command/commands/composed/type-helpers";
import { IsSelfHandled } from "../../command/commands/type-helpers";
import { EmptyRecord } from "../../common/types";
import { Cast, ToList } from "../../common/types-util";
import { HandlerSyncType } from "../handler-function/type";
import { ComposableHandler } from "./type-composable-handler";

//  | IsSelfHandled<TCommand> extends true ? undefined : never

/**
 * @description Gets the type of a composable handler for the given command
 */
export type ComposableHandlerFor<
  TCommand extends Command,
  TSyncType extends HandlerSyncType = HandlerSyncType,
  TReturn = unknown,
  TGlobalArgv extends EmptyRecord = EmptyRecord,
> = TCommand extends CommandBasic ? ComposableHandler<
    GetCommandArgs<TCommand, TGlobalArgv>,
    [TCommand["commandName"]],
    TSyncType,
    TReturn
  >
  : TCommand extends CommandComposed ? ComposableHandler<
      GetComposedParseResult<TCommand, TGlobalArgv>,
      IsSelfHandled<TCommand> extends true
        ? [...GetComposedCommandsNamesList<TCommand>, undefined]
        : GetComposedCommandsNamesList<TCommand>,
      TSyncType,
      TReturn
    >
  : TCommand extends CommandComposedWithSubcommands ? ComposableHandler<
      GetCommandArgs<TCommand, TGlobalArgv>,
      [GetCommandName<TCommand>],
      TSyncType,
      TReturn
    >
  : never;
