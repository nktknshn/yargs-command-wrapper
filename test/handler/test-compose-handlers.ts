import { expectTypeOf } from "expect-type";
import { buildAndParseUnsafe, comm, comp, subs } from "../../src";
import { CommandArgs } from "../../src/command/commands/args/type-command-args";
import { NestedCommandArgs } from "../../src/command/commands/args/type-nested-command-args";
import { HandlerFunction } from "../../src/handler";
import { createHandlerFor } from "../../src/handler/create-handler-for/create-handler-for";
import { ComposableHandlerForSubcommands } from "../../src/handler/create-handler-for/type-create-handler-for";
import { GetReturnType } from "../../src/handler/create-handler-for/type-helpers";
import { composeHandlers } from "../../src/handler/handler-composable/compose";
import { ComposableHandler } from "../../src/handler/handler-composable/type";
import {
  ComposedHandlers,
  ComposeReturnType,
} from "../../src/handler/handler-composable/types-compose";
import {
  com,
  com1,
  com1com2,
  com2,
  com2com3,
  com5,
  com6,
  com7,
  command3,
} from "./fixtures";

describe("compose handlers", () => {
  test("basic", () => {
    const com1handler = createHandlerFor(com1, (args) => {});
    const com2handler = createHandlerFor(com2, (args) => {});

    const com1com2handler = composeHandlers(com1handler, com2handler);

    const { result } = buildAndParseUnsafe(com1com2, "com1 -a");

    com1com2handler.handle(result);
  });

  test("compose return type", () => {
    const com1handler = createHandlerFor(com1, (args) => 1);
    const com2handler = createHandlerFor(com2, (args) => "123");

    const com1com2handler = composeHandlers(com1handler, com2handler);
    type F = (args: {
      a: string;
    }) => void;

    type Z = F extends HandlerFunction ? 1 : 2;
    type A = ComposeReturnType<[typeof com1handler, typeof com2handler]>;

    expectTypeOf(com1com2handler.handle).returns.toEqualTypeOf<
      number | string
    >();
  });

  test("compose like example 1", () => {
    const cmdClient0 = comp(com("client1"), com("client2"));
    const cmdConfig0 = comp(com("cfg1"), com("cfg2"));

    const cmdConfig = subs(com("config"), cmdConfig0);

    const cmdClient = comp(cmdClient0, cmdConfig);

    const cmdClient0handler = createHandlerFor(cmdClient0, (args) => {});
    const cmdConfig0handler = createHandlerFor(cmdConfig0, (args) => {});

    const cmdClientHandler = composeHandlers(
      cmdClient0handler,
      createHandlerFor(cmdConfig, cmdConfig0handler),
    );

    const subClient = subs(com("client"), cmdClient);

    type A = ComposableHandlerForSubcommands<typeof subClient>;
    type B = typeof cmdClientHandler;

    type C = B extends A ? 1 : 2;

    createHandlerFor(subClient, cmdClientHandler);

    const cmdServer = subs(com5, comp(com6, com7));

    const cmdServerHandler = createHandlerFor(cmdServer, (args) => {});

    const cmd = comp(
      subClient,
      cmdServer,
    );

    createHandlerFor(cmd, {
      "client": cmdClientHandler,
      "com5": cmdServerHandler,
    });
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

    type Args = CommandArgs<never, never>;
    type A = Parameters<typeof handler3["handle"]>[0];
    type Ex0 = Args extends A ? true : false;

    type A0 = Parameters<typeof handler3["handle"]>[0];
    type ExA0 = Args extends
      { command: "abcd"; subcommand: "abcd"; argv: { a: number } } ? true
      : false;

    type EX1 = typeof handler3 extends ComposableHandler ? true : false;

    type H = ComposedHandlers<[
      typeof handler12,
      typeof handler3,
    ]>;

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
