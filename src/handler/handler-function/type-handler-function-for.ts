import {
  Command,
  CommandBasic,
  CommandComposed,
  CommandComposedWithSubcommands,
  GetCommandParseResult,
} from "../../command";
import { EmptyRecord } from "../../common/types";
import { HandlerFunction } from "./type";

/**
 * @description Returns the type of the function that will handle arguments returned after parsing by `TCommand`
 */
export type HandlerFunctionFor<
  TCommand extends Command,
  TGlobalArgv extends EmptyRecord = EmptyRecord,
> =
  // or `BasicCommand` this is just a function takes `TArgv`
  TCommand extends CommandBasic<infer TName, infer TArgv>
    ? HandlerFunction<{ command: TName; argv: TArgv & TGlobalArgv }>
    : TCommand extends CommandComposed ? HandlerFunction<
        GetCommandParseResult<TCommand, TGlobalArgv>
      >
    : TCommand extends CommandComposedWithSubcommands ? HandlerFunction<
        GetCommandParseResult<TCommand, TGlobalArgv>
      >
    : never;
