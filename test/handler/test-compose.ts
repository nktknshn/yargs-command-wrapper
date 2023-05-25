import { comm, comp, subs } from "../../src";
import {
  GetCommandName,
  GetComposedCommandsNames,
} from "../../src/create-handler-for";
import { CommandArgs, GetArgv, HandlerFunctionFor } from "../../src/handler";
import { composedCommandNames } from "../../src/handler-helpers";
import {
  BasicCommand,
  Command,
  CommandWithSubcommands,
  ComposedCommands,
  NonEmptyTuple,
} from "../../src/types";
import { Cast } from "../../src/util";
import { ToList, ToUnion } from "../../src/util";
import { opt } from "../types/addOption";

interface BasicHandlerComposable<TName extends string, TArgv extends {}> {
  (argv: TArgv): void;
  (argv: TArgv): Promise<void>;
  supports: TName[];
}

interface ParentingHandlerComposable<
  TNames extends readonly string[],
  TArgv extends CommandArgs,
> {
  (argv: TArgv): void;
  supports: TNames;
}

type ComposableHandler =
  | BasicHandlerComposable<string, any>
  | ParentingHandlerComposable<readonly string[], any>;

type ComposeNames<THandlers extends readonly ComposableHandler[]> =
  ToUnion<THandlers> extends infer T
    ? T extends BasicHandlerComposable<infer TName, infer TArgv> ? TName
    : T extends ParentingHandlerComposable<infer TNames, infer TArgv>
      ? ToUnion<TNames>
    : never
    : never;

type ComposeArgv<THandlers extends readonly ComposableHandler[]> =
  ToUnion<THandlers> extends infer T
    ? T extends BasicHandlerComposable<infer TName, infer TArgv>
      ? { command: TName; argv: TArgv }
    : T extends ParentingHandlerComposable<infer TNames, infer TArgv> ? TArgv
    : never
    : never;

type N = ComposeNames<[
  BasicHandlerComposable<"list", {}>,
  ParentingHandlerComposable<["config"], CommandArgs>,
]>;

type A = ComposeArgv<[
  BasicHandlerComposable<"list", {}>,
  ParentingHandlerComposable<["config", "download"], CommandArgs>,
]>;

/**
 * @description Composes handlers
 */
type ComposedHandlers<THandlers extends readonly ComposableHandler[]> =
  ParentingHandlerComposable<ComposeNames<THandlers>, ComposeArgv<THandlers>>;

function composeHandlers<THandlers extends readonly ComposableHandler[]>(
  ...handlers: THandlers
): ComposedHandlers<THandlers> {
  const supports: string[] = [];

  for (const h of handlers) {
    supports.push(...h.supports);
  }

  let _handler = (args: CommandArgs): void => {
    for (const h of handlers) {
      if (h.supports.includes(args.command)) {
        h(args);
        return;
      }
    }

    throw new Error(`No handler found for command ${args.command}`);
  };

  return _createHandler(_handler, supports) as ComposedHandlers<THandlers>;
}

const _createHandler = (
  handler: HandlerFunctionFor<Command>,
  supports: string[],
): ComposableHandler => {
  const _handler = (args: any): void => {
    handler(args);
  };
  _handler.supports = supports;

  return _handler;
};

function handlerFor<
  TCommand extends BasicCommand,
  H extends HandlerFunctionFor<TCommand>,
>(
  command: TCommand,
  handler: H,
): BasicHandlerComposable<TCommand["commandName"], GetArgv<TCommand>>;

function handlerFor<
  TCommand extends ComposedCommands,
  H extends HandlerFunctionFor<TCommand>,
>(
  command: TCommand,
  handler: H,
): ParentingHandlerComposable<
  Cast<ToList<GetComposedCommandsNames<TCommand>>, readonly string[]>,
  Parameters<H>[0]
>;

function handlerFor<
  TCommand extends CommandWithSubcommands,
  H extends HandlerFunctionFor<TCommand>,
>(
  command: TCommand,
  handler: H,
): ParentingHandlerComposable<[GetCommandName<TCommand>], Parameters<H>[0]>;

function handlerFor<
  TCommand extends Command,
  H extends HandlerFunctionFor<TCommand>,
>(
  command: TCommand,
  handler: H,
): ComposableHandler {
  if (command.type === "command") {
    return _createHandler(handler, [command.commandName]);
  }
  else if (command.type === "composed") {
    return _createHandler(handler, composedCommandNames(command));
  }
  else {
    return _createHandler(handler, [command.command.commandName]);
  }
}

describe("composing handlers", () => {
  test("compose", () => {
    const command = comm("com1", "description", opt("a"));
    const command2 = comp(
      comm("com2", "description", opt("c")),
      comm("com3", "description", opt("d")),
    );
    const command3 = subs(
      comm("com4", "com4", opt("com4argv")),
      [
        comm("sub1", "com5", opt("sub1argv")),
        comm("sub2", "com6", opt("sub2argv")),
      ],
    );

    const composedCommand = comp(command, command2, command3);

    const [handlerfn1, handlerfn2, handlerfn3] = [
      jest.fn(),
      jest.fn(),
      jest.fn(),
    ];

    const handler1 = handlerFor(command, (args) => {
      console.log(args);

      handlerfn1(args.a);
    });

    const handler2 = handlerFor(command2, (args) => {
      handlerfn2(args.argv);
    });

    const handler3 = handlerFor(command3, (args) => {
      args.command;
      args.subcommand;
      handlerfn3(args.argv.com4argv);
    });

    const composedHandler = composeHandlers(handler1, handler2, handler3);

    composedHandler({ command: "com1", argv: { a: "123" } });
    expect(handlerfn1.mock.calls.length).toBe(1);
    expect(handlerfn1).toBeCalledWith("123");

    composedHandler({ command: "com2", argv: { c: "123" } });
    expect(handlerfn2).toBeCalledWith({ c: "123" });
    composedHandler({ command: "com3", argv: { d: "123" } });
    expect(handlerfn2).toBeCalledWith({ d: "123" });
  });
});
