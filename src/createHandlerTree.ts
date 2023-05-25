import {
  _createHandlerFor,
  GetInputStructHandlerType,
  InputStructHandlerFor,
} from "./create-handler-for";
import { HandlerFunctionFor } from "./handler";
import { Command } from "./types";

// export const createHandlerTree = <
//   TCommand extends Command | readonly Command[],
//   TInput extends InputStructHandlerFor<TCommand>,
// >(
//   command: TCommand,
//   recordOrFunction: TInput,
// ): HandlerFunctionFor<TCommand, GetInputStructHandlerType<TInput>> => {
//   return _createHandlerFor(command, recordOrFunction);
// };
