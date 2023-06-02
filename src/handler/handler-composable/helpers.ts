import { ComposableHandler } from "./type";

export const showComposableHandler = (handler: ComposableHandler) => {
  return `ComposableHandler(${handler.supports.join(", ")})`;
};
