import { expectTypeOf } from "expect-type";
import { comp, subs } from "../../../src";
import { createHandlerFor } from "../../../src/handler/create-handler-for/create-handler-for";
import {
  com1,
  com1com2,
  com2,
  com2com3,
  com3,
  composedCommand,
  deepNested,
  s1s2comp,
  subsCommand,
} from "../fixtures";

describe("createHandlerFor sync type", () => {
  test("syncness", () => {
    const handlerAsync = createHandlerFor(com1, async args => {});
    expectTypeOf(handlerAsync.handle).returns.toEqualTypeOf<Promise<void>>();
    const handlerSync = createHandlerFor(com1, args => {});
    expectTypeOf(handlerSync.handle).returns.toEqualTypeOf<void>();

    const handlerSync2 = createHandlerFor(com1com2, {
      "com1": args => {},
      "com2": args => {},
    });

    expectTypeOf(handlerSync2.handle).returns.toEqualTypeOf<void>();

    const handlerAsync2 = createHandlerFor(com1com2, {
      "com1": async args => {},
      "com2": async args => {},
    });

    expectTypeOf(handlerAsync2.handle).returns.toEqualTypeOf<Promise<void>>();

    const handlerMixed2 = createHandlerFor(com1com2, {
      "com1": async args => {},
      "com2": args => {},
    });

    expectTypeOf<ReturnType<typeof handlerMixed2.handle>>().toEqualTypeOf<
      Promise<void> | void
    >();

    const handlerSync3 = createHandlerFor(subsCommand, () => {});
    const handlerAsync3 = createHandlerFor(subsCommand, async () => {});

    expectTypeOf(handlerSync3.handle).returns.toEqualTypeOf<void>();
    expectTypeOf(handlerAsync3.handle).returns.toEqualTypeOf<Promise<void>>();

    const nested1 = subs(com3, com1com2);

    const handler3 = createHandlerFor(nested1, handlerSync2);
    const handler3a = createHandlerFor(nested1, handlerAsync2);
    const handler3m = createHandlerFor(nested1, handlerMixed2);

    expectTypeOf(handler3.handle).returns.toEqualTypeOf<void>();

    expectTypeOf(handler3a.handle).returns.toEqualTypeOf<Promise<void>>();

    type R2 = ReturnType<typeof handler3m.handle>;

    // XXX fix this maybe
    expectTypeOf<R2>().toEqualTypeOf<
      void | Promise<void> | Promise<void | Promise<void>>
    >();
  });
});
