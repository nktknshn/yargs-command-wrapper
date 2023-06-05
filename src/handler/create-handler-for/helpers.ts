import { Command } from "../../command";
import { isObjectWithOwnProperty } from "../../common/util";
import { ComposableHandler } from "../handler-composable/type-composable-handler";
import { InputHandlerRecordType } from "./type-create-handler-for";
import { InputHandlerFunctionFor } from "./type-input-function";

export const isFunctionHandler = <TCommand extends Command>(
  handler:
    | InputHandlerFunctionFor<Command>
    | InputHandlerRecordType
    | ComposableHandler,
): handler is InputHandlerFunctionFor<TCommand> => {
  return typeof handler === "function";
};

export const isRecordHandler = <TCommand extends Command>(
  handler:
    | InputHandlerFunctionFor<TCommand>
    | InputHandlerRecordType
    | ComposableHandler,
): handler is InputHandlerRecordType => {
  return typeof handler === "object";
};

export const isComposableHandler = (
  handler:
    | InputHandlerFunctionFor<Command>
    | InputHandlerRecordType
    | ComposableHandler,
): handler is ComposableHandler => {
  return isObjectWithOwnProperty(handler, "handle");
};
