import {
  Command,
  CommandBasic,
  CommandComposed,
  CommandComposedWithSubcommands,
  GetCommandArgs,
} from "../../command";
import { EmptyRecord } from "../../common/types";
import { HandlerFunction } from "./type";

/**
 * @description Returns the type of the function that will handle arguments returned after parsing by `TCommand`.
 * ```
 * const handler: HandlerFunctionFor<typeof cmd> = (args) => {}
 * const { result } = buildAndParseUnsafeR(cmd);
 * handler(result);
 * ```
 */
export type HandlerFunctionFor<
  TCommand extends Command,
  TGlobalArgv extends EmptyRecord = EmptyRecord,
> = TCommand extends CommandBasic<infer TName, infer TArgv>
  ? HandlerFunction<{ command: TName; argv: TArgv }>
  : TCommand extends CommandComposed ? HandlerFunction<
      GetCommandArgs<TCommand, TGlobalArgv>
    >
  : TCommand extends CommandComposedWithSubcommands ? HandlerFunction<
      GetCommandArgs<TCommand, TGlobalArgv>
    >
  : never;
