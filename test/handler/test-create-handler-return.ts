import { expectTypeOf } from "expect-type";
import { createHandlerFor } from "../../src/handler/create-handler-for/create-handler-for";
import {
  com1,
  com1com2,
  command3,
  s1s2comp,
  sub3,
} from "./test-create-handler-for";

describe("handlerFor return type", () => {
  test("basic", () => {
    expectTypeOf(createHandlerFor(com1, () => {}).handle).returns
      .toEqualTypeOf<void>();
    expectTypeOf(createHandlerFor(com1, () => "123").handle).returns
      .toEqualTypeOf<string>();

    expectTypeOf(createHandlerFor(com1com2, () => "123").handle).returns
      .toEqualTypeOf<string>();
    expectTypeOf(createHandlerFor(com1com2, () => {}).handle).returns
      .toEqualTypeOf<void>();

    expectTypeOf(createHandlerFor(sub3, () => {}).handle).returns
      .toEqualTypeOf<void>();
    expectTypeOf(createHandlerFor(sub3, async () => "123").handle).returns
      .toEqualTypeOf<Promise<string>>();
  });

  test("composed", () => {
    const h = createHandlerFor(com1com2, {
      "com1": (): number => 1,
      "com2": (): string => "123",
    }).handle({ command: "com1", argv: { a: "123" } });

    expectTypeOf(
      createHandlerFor(com1com2, { "com1": () => 1, "com2": () => "123" })
        .handle,
    ).returns
      .toMatchTypeOf<number | string>();

    expectTypeOf(
      createHandlerFor(sub3, { "subsub1": () => 1, "subsub2": () => "123" })
        .handle,
    ).returns
      .toMatchTypeOf<number | string>();

    expectTypeOf(
      createHandlerFor(sub3, { "subsub1": () => 1, "subsub2": () => "123" })
        .handle,
    ).returns
      .toMatchTypeOf<number | string>();

    expectTypeOf(
      createHandlerFor(command3, {
        "sub1": () => 1,
        "sub2": () => "123",
        "sub3": (): string[] => [],
      })
        .handle,
    ).returns
      .toMatchTypeOf<number | string | string[]>();

    expectTypeOf(
      createHandlerFor(command3, {
        "sub1": () => 1,
        "sub2": () => "123",
        "sub3": {
          "subsub1": (): number[] => [],
          "subsub2": (): string[] => [],
        },
      })
        .handle,
    ).returns
      .toMatchTypeOf<number | string | number[] | string[]>();

    const sub3handler = createHandlerFor(sub3, {
      "subsub1": (): number[] => [],
      "subsub2": (): string[] => [],
    });

    expectTypeOf(
      createHandlerFor(command3, {
        "sub1": () => 1,
        "sub2": () => "123",
        "sub3": sub3handler,
      })
        .handle,
    ).returns
      .toMatchTypeOf<number | string | number[] | string[]>();
  });
});
