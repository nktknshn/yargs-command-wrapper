import { Command } from "../command";
import { isObjectWithOwnProperty } from "../common/util";
import {
  GetHandlersRecordReturnType,
  GetHandlersRecordType,
  HandlerFunctionFor,
  HandlerFunctionForComposed,
  HandlersRecord,
  IsHandlersRecord,
  IsSameHandlersType,
} from "./types-handler-function";

import { popCommand } from "./helpers";

/**
 * @description Creates a function handler for
 * @param record the handlers record. Keys are command names and values are their handler functions
 * @returns a handler that will handle the command
 */
export const subsHandlers = <TRec extends HandlersRecord>(
  record: TRec & IsHandlersRecord<TRec> & IsSameHandlersType<TRec>,
): HandlerFunctionForComposed<
  GetHandlersRecordReturnType<TRec>,
  GetHandlersRecordType<TRec>
> =>
(args) => {
  const handler = record[args.command];

  if (isObjectWithOwnProperty(args, "subcommand")) {
    return handler(popCommand(args));
  }
  else {
    return handler(args.argv);
  }
};

/**
 * @description Helps to type a handler function for a command
 * @param cmd Command to handle
 * @param handler Handler function
 * @returns Handler function
 */
export const handlerFor = <
  TCommand extends Command,
  H extends HandlerFunctionFor<TCommand>,
>(cmd: TCommand, handler: H): H => {
  return handler;
};
