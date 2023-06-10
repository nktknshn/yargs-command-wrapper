import { GetSyncType } from "../create-handler-for/type-helpers";
import { HandlerFunction } from "./type";
import { HandlerFunctionExtendArgs } from "./type-helpers";

describe("types", () => {
  test("extends args", () => {
    type A = HandlerFunction<{ a: 1 }, "sync", 1>;
    type B = HandlerFunctionExtendArgs<A, { b: 2 }>;
    type C = HandlerFunction<{ a: 1 } | { b: 2 }, "sync", 1>;

    expectTypeOf<B>().toEqualTypeOf<C>();

    type D = HandlerFunctionExtendArgs<A, never>;
    expectTypeOf<D>().toEqualTypeOf<A>();
  });
});
