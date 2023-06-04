import { ComposableHandler } from "./type";

export const showComposableHandler = <
  H extends ComposableHandler<never>,
>(
  handler: H,
) => {
  return `ComposableHandler(${handler.supports.join(", ")})`;
};
