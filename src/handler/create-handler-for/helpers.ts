import { Command } from "../../command";
import { isObjectWithOwnProperty } from "../../common/util";
import { ComposableHandlerFor } from "../handler-composable/composable-handler-for";
import { ComposableHandler } from "../handler-composable/type";
import { InputRecordHandler } from "./type-create-handler-for";
import { InputHandlerFunctionFor } from "./type-input-function";

export const isFunctionHandler = <TCommand extends Command>(
  handler:
    | InputHandlerFunctionFor<Command>
    | InputRecordHandler
    | ComposableHandler,
): handler is InputHandlerFunctionFor<TCommand> => {
  return typeof handler === "function";
};

export const isRecordHandler = <TCommand extends Command>(
  handler:
    | InputHandlerFunctionFor<TCommand>
    | InputRecordHandler
    | ComposableHandler,
): handler is InputRecordHandler => {
  return typeof handler === "object";
};

export const isComposableHandler = <TCommand extends Command>(
  handler:
    | InputHandlerFunctionFor<Command>
    | InputRecordHandler
    | ComposableHandler,
): handler is ComposableHandlerFor<TCommand> => {
  return isObjectWithOwnProperty(handler, "handle");
};
