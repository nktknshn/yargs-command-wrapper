import { expectTypeOf } from "expect-type";
import { buildAndParseUnsafe, comm, comp } from "../../src";
import { composeHandlers } from "../../src/handler/compose";
import { createHandlerFor } from "../../src/handler/create-handler-for/create-handler-for";
import {
  com1,
  com1com2,
  com2,
  com2com3,
  command3,
} from "./test-create-handler-for";

describe("compose handlers", () => {
  test("basic", () => {
    const com1handler = createHandlerFor(com1, (args) => {});
    const com2handler = createHandlerFor(com2, (args) => {});

    const com1com2handler = composeHandlers(com1handler, com2handler);

    const { result } = buildAndParseUnsafe(com1com2, ["com1"]);

    com1com2handler.handle(result);
  });

  test("compose return type", () => {
    const com1handler = createHandlerFor(com1, (args) => 1);
    const com2handler = createHandlerFor(com2, (args) => "123");

    const com1com2handler = composeHandlers(com1handler, com2handler);

    expectTypeOf(com1com2handler.handle).returns.toEqualTypeOf<
      number | string
    >();
  });

  test("cocompose", () => {
    const [hfn1, hfn2, hfn3, hfn4] = [
      jest.fn(),
      jest.fn(),
      jest.fn(),
      jest.fn(),
    ];

    const handler1 = createHandlerFor(com1, (args) => {
      args.a;

      hfn1(args);
    });

    handler1.handle({ command: "com1", argv: { a: "123" } });
    expect(hfn1).toBeCalledWith({ a: "123" });

    const handler2 = createHandlerFor(com2com3, (args) => {
      args.command;
      switch (args.command) {
        case "com2":
          hfn2(args);
          args.argv.c;
          break;
        case "com3":
          args.argv.d;
          args.command;
          hfn3(args);
          break;
      }
    });

    const handler3 = createHandlerFor(command3, (args) => {
      args.command;
      expectTypeOf(args.command).toEqualTypeOf<"sub1" | "sub2" | "sub3">();
      // args.subcommand;
      hfn4(args.argv);
    });

    const handler12 = composeHandlers(handler1, handler2);

    const composedHandler = composeHandlers(
      handler12,
      handler3,
    );

    composedHandler.handle({ command: "com1", argv: { a: "123" } });

    composedHandler.handle({ command: "com2", argv: { c: "123" } });
    expect(hfn2).toBeCalledWith({
      command: "com2",
      argv: { c: "123" },
    });

    composedHandler.handle({ command: "com3", argv: { d: "123" } });
    expect(hfn3).toBeCalledWith({ command: "com3", argv: { d: "123" } });

    composedHandler.handle({
      command: "com4",
      subcommand: "sub1",
      argv: { com4argv: "123", sub1argv: "456" },
    });

    expect(hfn4).toBeCalledWith({
      com4argv: "123",
      sub1argv: "456",
    });
  });
});
