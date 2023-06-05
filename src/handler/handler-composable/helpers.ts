import { ComposableHandler } from "./type-composable-handler";

export const showComposableHandler = (
  handler: ComposableHandler,
) => {
  return `ComposableHandler(${handler.supports.join(", ")})`;
};
