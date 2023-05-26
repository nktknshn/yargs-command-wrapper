import {
  ComposeCommandsFlatten,
  findByNameInComposed,
  GetCommandName,
  GetComposedCommandsNames,
  InputHandlerFunctionFor,
} from "../../src/create-handler-for";
import {
  CommandArgs,
  HandlerFunction,
  HandlerType,
  NestedCommandArgs,
  popCommand,
} from "../../src/handler";
import { composedCommandNames } from "../../src/handler-helpers";
import {
  BasicCommand,
  Command,
  CommandWithSubcommands,
  ComposedCommands,
  GetCommandReturnType,
  GetComposedReturnType,
} from "../../src/types";
import { Cast, isObjectWithOwnProperty, TupleKeys } from "../../src/util";
import { ToList, ToUnion } from "../../src/util";

interface BasicHandlerComposable<TName extends string, TArgv extends {}> {
  handle(argv: TArgv): void;
  supports: TName[];
}

interface ComposedHandlerComposable<
  TNames extends readonly string[],
  TArgv extends CommandArgs,
> {
  handle(argv: TArgv): void;
  supports: TNames;
}

export type ComposableHandlerFor<
  TCommand extends Command,
  TGlobalArgv extends {} = {},
> = TCommand extends //
BasicCommand ? BasicHandlerComposable<
    TCommand["commandName"],
    GetCommandReturnType<TCommand>
  >
  //
  : TCommand extends ComposedCommands ? ComposedHandlerComposable<
      Cast<ToList<GetComposedCommandsNames<TCommand>>, readonly string[]>,
      GetComposedReturnType<TCommand>
    >
  //
  : TCommand extends CommandWithSubcommands ? ComposedHandlerComposable<
      [GetCommandName<TCommand>],
      GetCommandReturnType<TCommand>
    >
  : never;

type ComposableHandler =
  | BasicHandlerComposable<string, any>
  | ComposedHandlerComposable<readonly string[], any>;

type ComposeNames<THandlers extends readonly ComposableHandler[]> = Cast<
  ToList<
    ToUnion<THandlers> extends infer T
      ? T extends BasicHandlerComposable<infer TName, infer TArgv> ? TName
      : T extends ComposedHandlerComposable<infer TNames, infer TArgv>
        ? ToUnion<TNames>
      : never
      : never
  >,
  readonly string[]
>;

type ComposeArgv<THandlers extends readonly ComposableHandler[]> =
  ToUnion<THandlers> extends infer T
    ? T extends BasicHandlerComposable<infer TName, infer TArgv> ? TArgv
    : T extends ComposedHandlerComposable<infer TNames, infer TArgv> ? TArgv
    : never
    : never;

type N = ComposeNames<[
  BasicHandlerComposable<"list", {}>,
  ComposedHandlerComposable<["config"], CommandArgs>,
]>;
type A = ComposeArgv<[
  BasicHandlerComposable<"list", {}>,
  ComposedHandlerComposable<["config", "download"], CommandArgs>,
]>;

type ComposedCommandsInputRecord<
  TCommand extends ComposedCommands,
  TGlobalArgv extends {},
> = ComposeCommandsFlatten<TCommand> extends ComposedCommands<
  infer TCommands,
  infer TArgv
> ? {
    [
      // key is the name of the command
      P in TupleKeys<TCommands> as GetCommandName<
        Cast<TCommands[P], Command>
      >
    ]:
      // the value is a function
      | InputHandlerFunctionFor<
        Cast<TCommands[P], Command>,
        TArgv & TGlobalArgv,
        HandlerType
      >
      // the value is another handler
      | ComposableHandlerFor<Cast<TCommands[P], Command>, TArgv & TGlobalArgv>
      // the value is a record
      | InputRecordHandlerFor<Cast<TCommands[P], Command>, TArgv & TGlobalArgv>;
  }
  : never;

type InputRecordHandlerFor<
  TCommand extends Command | readonly Command[],
  // `TGlobalArgv` is object to intersect with `TArgv` of `TCommand`
  TGlobalArgv extends {} = {},
> = TCommand extends ComposedCommands
  ? ComposedCommandsInputRecord<TCommand, TGlobalArgv>
  // subcommand
  : TCommand extends CommandWithSubcommands<
    infer TName,
    infer TCommands,
    infer TArgv,
    infer TCommandArgv
  > ? ComposedCommandsInputRecord<
      ComposedCommands<TCommands, TArgv & TCommandArgv & TGlobalArgv>,
      TGlobalArgv
    >
  : never;
/**
 * @description Composes handlers
 */
type ComposedHandlers<THandlers extends readonly ComposableHandler[]> =
  ComposedHandlerComposable<ComposeNames<THandlers>, ComposeArgv<THandlers>>;
export function composeHandlers<THandlers extends readonly ComposableHandler[]>(
  ...handlers: THandlers
): ComposedHandlers<THandlers> {
  const supports: string[] = [];

  for (const h of handlers) {
    supports.push(...h.supports);
  }

  let _handler = (args: CommandArgs): void => {
    for (const h of handlers) {
      if (h.supports.includes(args.command)) {
        return h.handle(args);
      }
    }

    throw new Error(`No handler found for command ${args.command}`);
  };

  return _createHandler(_handler, supports) as ComposedHandlers<THandlers>;
}
const _createHandler = (
  handler: InputHandlerFunctionFor<Command>,
  supports: string[],
): ComposableHandler => {
  const _handler = (args: any): void => {
    handler(args);
  };
  // _handler.supports = supports;

  return {
    handle: _handler,
    supports,
  };
};

type InputRecordHandler = {
  [key: string]: HandlerFunction | InputRecordHandler | ComposableHandler;
};

const isComposableHandler = (
  handler: HandlerFunction | InputRecordHandler | ComposableHandler,
): handler is ComposableHandler => {
  return isObjectWithOwnProperty(handler, "handle");
};

export function handlerFor<
  TCommand extends BasicCommand,
>(
  command: TCommand,
  handler: InputHandlerFunctionFor<TCommand>,
): ComposableHandlerFor<TCommand>;

export function handlerFor<
  TCommand extends ComposedCommands,
>(
  command: TCommand,
  handler: InputHandlerFunctionFor<TCommand> | InputRecordHandlerFor<TCommand>,
): ComposableHandlerFor<TCommand>;

export function handlerFor<
  TCommand extends CommandWithSubcommands,
>(
  command: TCommand,
  handler: InputHandlerFunctionFor<TCommand> | InputRecordHandlerFor<TCommand>,
): ComposableHandlerFor<TCommand>;

export function handlerFor<
  TCommand extends Command,
>(
  command: TCommand,
  functionOrRecord:
    // either a function or a record
    | InputHandlerFunctionFor<TCommand>
    | InputRecordHandler,
): ComposableHandler {
  if (typeof functionOrRecord === "function") {
    if (command.type === "command") {
      return _createHandler(functionOrRecord, [command.commandName]);
    }
    else if (command.type === "composed") {
      return _createHandler(functionOrRecord, composedCommandNames(command));
    }
    else {
      return _createHandler(functionOrRecord, [command.command.commandName]);
    }
  }
  else {
    if (command.type === "composed") {
      //
      const handlerFunction = (args: CommandArgs): void => {
        const commandName = args.command;
        if (!(args.command in functionOrRecord)) {
          throw new Error(`No handler found for command ${commandName}`);
        }

        const handler = functionOrRecord[commandName];

        const namedCommand = findByNameInComposed(
          command.commands,
          commandName,
        );

        if (namedCommand === undefined) {
          throw new Error(`No command ${commandName} among composed`);
        }

        if (typeof handler === "function") {
          if (namedCommand.type === "command") {
            return handler(args.argv);
          }
          return handler(args);
        }
        else if (isComposableHandler(handler)) {
          if (namedCommand.type === "command") {
            return handler.handle(args.argv);
          }
          else {
            return handler.handle(args);
          }
        }
        else {
          if (namedCommand.type === "with-subcommands") {
            return handlerFor(namedCommand, handler).handle(args);
          }
          else {
            throw new Error(`No handler found for command ${commandName}`);
          }
        }
      };

      return _createHandler(handlerFunction, composedCommandNames(command));
    }
    else if (command.type === "with-subcommands") {
      const handlerFunction = (args: NestedCommandArgs<{}>): void => {
        const commandName = args.command;

        if (command.command.commandName !== commandName) {
          throw new Error(`Unmatched command name ${commandName}`);
        }

        const _args = popCommand(args);

        if (!(_args.command in functionOrRecord)) {
          throw new Error(`No handler found for command ${commandName}`);
        }

        const handler = functionOrRecord[_args.command];

        if (typeof handler === "function") {
          return handler(_args.argv);
        }
        else if (isComposableHandler(handler)) {
          return handler.handle(_args);
        }
        else {
          return handlerFor(command, handler).handle(_args);
        }
      };

      return _createHandler(handlerFunction, [command.command.commandName]);
    }
    else {
      throw new Error(`Invalid handler for ${command.commandName}`);
    }
  }
}
