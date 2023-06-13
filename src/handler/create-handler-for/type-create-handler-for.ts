import {
  Command,
  CommandBasic,
  CommandComposed,
  CommandComposedWithSubcommands,
} from "../../command";
import { ComposedProps } from "../../command/commands/composed/type-command-composed";
import {
  CommandsFlattenList,
  GetCommandName,
} from "../../command/commands/composed/type-helpers";
import { IsSelfHandled } from "../../command/commands/type-helpers";
import { GetSubsPropsUnion } from "../../command/commands/with-subcommands/type-helpers";
import { EmptyRecord } from "../../common/types";
import { Cast, TupleKeys } from "../../common/types-util";
import { ComposableHandler } from "../handler-composable/type-composable-handler";
import { ComposableHandlerFor } from "../handler-composable/type-composable-handler-for";
import { HandlerFunction, HandlerSyncType } from "../handler-function/type";
import { InputHandlerFunctionFor } from "./type-input-function";

export const SelfHandlerKey = "$self";
export type SelfHandlerKey = typeof SelfHandlerKey;
/**
 * @description Generic type for a record that defines a handler for a command.
 */
export type InputHandlerRecordType<TArgv extends EmptyRecord = EmptyRecord> = {
  [key: string]:
    | HandlerFunction<TArgv>
    | InputHandlerRecordType<TArgv>
    // | ComposableHandler<CommandArgs>;
    | ComposableHandler<any>;
  // XXX remove any...
};

type InputSelfHandlerCommandRecord<TArgv extends EmptyRecord> = {
  [SelfHandlerKey]: InputHandlerFunctionFor<CommandBasic<"", TArgv>>;
};

/**
 * @description defines a record that can be used to create a handler for a composed command or a command with subs.
 */
export type InputHandlerRecordFor<
  TCommand extends Command,
  TGlobalArgv extends EmptyRecord = EmptyRecord,
> =
  //
  // Record for CommandComposed
  TCommand extends CommandComposed<infer TCommands, infer TArgv, infer TProps>
    ? 
      & InputHandlerRecordForCommands<TCommands, TGlobalArgv & TArgv>
      & (IsSelfHandled<TProps> extends true
        ? InputSelfHandlerCommandRecord<TArgv & TGlobalArgv>
        : EmptyRecord)
    //
    //
    // Record for CommandComposedWithSubcommands
    : TCommand extends CommandComposedWithSubcommands<
      string,
      infer TCommands,
      infer TArgv,
      infer TCommandArgv,
      infer TProps,
      infer TComposedProps
    >
    // For CommandComposedWithSubcommands the record defines handlers for the subcommands
      ? 
        & InputHandlerRecordForCommands<
          TCommands,
          TGlobalArgv & TCommandArgv & TArgv
        >
        & (IsSelfHandled<TProps> & IsSelfHandled<TComposedProps> extends true
          ? InputSelfHandlerCommandRecord<TArgv & TCommandArgv & TGlobalArgv>
          : EmptyRecord)
    : never;

/**
 * @description defines a record that can be used to create a handler for a list of commands.
 */
export type InputHandlerRecordForCommands<
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TCommands extends readonly Command[],
  TGlobalArgv extends EmptyRecord,
> = CommandsFlattenList<TCommands> extends infer TCommands ? {
    [
      // key is the name of the command
      P in TupleKeys<TCommands> as GetCommandName<
        Cast<TCommands[P], Command>
      >
    ]:
      // the value is a function
      | InputHandlerFunctionFor<
        Cast<TCommands[P], Command>,
        TGlobalArgv
      >
      // the value is another record
      | InputHandlerRecordFor<
        Cast<TCommands[P], Command>,
        TGlobalArgv
      >
      // the value is a ComposableHandler
      | ComposableHandlerFor<
        Cast<TCommands[P], Command>,
        HandlerSyncType,
        unknown,
        TGlobalArgv
      >
      // the value is a ComposableHandler for subcommands of a command with subcommands
      | ComposableHandlerForSubcommands<
        Cast<TCommands[P], Command>,
        TGlobalArgv
      >;
  }
  : never;

/**
 * @description handler for a command with subcommands can be created from a composable handler for the subcommands.
 */
export type ComposableHandlerForSubcommands<
  TCommand extends Command,
  TGlobalArgv extends EmptyRecord = EmptyRecord,
> = TCommand extends CommandComposedWithSubcommands
  //
  ? IsSelfHandled<GetSubsPropsUnion<TCommand>> extends true
    ? ComposableHandlerFor<
      TCommand["subcommands"] & { props: ComposedProps<true> },
      HandlerSyncType,
      unknown,
      TGlobalArgv
    >
    //
  : ComposableHandlerFor<
    TCommand["subcommands"],
    HandlerSyncType,
    unknown,
    TGlobalArgv
  >
  : never;
