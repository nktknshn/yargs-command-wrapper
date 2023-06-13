import {
  Command,
  CommandBasic,
  CommandComposed,
  CommandComposedWithSubcommands,
  GetCommandArgs,
} from "../../command";
import {
  GetCommandName,
  GetComposedCommandsNames,
} from "../../command/commands/composed/type-helpers";
import { IsSelfHandled } from "../../command/commands/type-helpers";
import { EmptyRecord } from "../../common/types";
import { SelfHandlerKey } from "../create-handler-for/type-create-handler-for";
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
    TCommand["commandName"],
    TSyncType,
    TReturn
  >
  : TCommand extends CommandComposed ? ComposableHandler<
      GetCommandArgs<TCommand, TGlobalArgv>,
      IsSelfHandled<TCommand> extends true
        ? GetComposedCommandsNames<TCommand> | SelfHandlerKey
        : GetComposedCommandsNames<TCommand>,
      TSyncType,
      TReturn
    >
  : TCommand extends CommandComposedWithSubcommands ? ComposableHandler<
      GetCommandArgs<TCommand, TGlobalArgv>,
      GetCommandName<TCommand>,
      TSyncType,
      TReturn
    >
  : never;
