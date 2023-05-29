import {
  BasicCommand,
  Command,
  CommandWithSubcommands,
  ComposedCommands,
} from "../types";
import { Cast, IntersectOf } from "../util";
import { ToList, ToUnion } from "../util";
import { HandlerFunctionFor } from "./types-handler";

/**
 * @description Gets command's handler args type
 */
export type GetArgv<TCommand extends Command> = Parameters<
  HandlerFunctionFor<TCommand>
>[0]["argv"];

/**
 * @description Gets a union of all the composed commands names
 */
export type GetComposedCommandsNames<T extends ComposedCommands> = T extends
  ComposedCommands<infer TCommands>
  ? GetCommandName<Cast<ToUnion<TCommands>, Command>>
  : never;

/**
 * @description Gets the name of a command. For a composed command it returns `never`
 */
export type GetCommandName<TCommand extends Command> = TCommand extends
  BasicCommand<infer TName, infer TArgv> ? TName
  : TCommand extends ComposedCommands ? never
  : TCommand extends
    CommandWithSubcommands<infer TName, infer TArgv, infer TCommands> ? TName
  : never;

/**
 * @description Flattens a composed commands tree into a list of commands that are not composed
 */
export type ComposeCommandsFlatten<TCommand extends Command> = ComposedCommands<
  Cast<ToList<_ComposeCommandsFlatten<TCommand>>, readonly Command[]>,
  _ComposeCommandsFlattenArgv<TCommand>
>;
type _ComposeCommandsFlatten<TCommand extends Command> = TCommand extends
  ComposedCommands<infer TCommands, infer TArgv>
  ? ToUnion<TCommands> extends infer C
    ? C extends ComposedCommands ? _ComposeCommandsFlatten<C> : C
  : never
  : never;

/**
 * @description Gets composed commands common Argv
 */
type _ComposeCommandsFlattenArgv<TCommand extends Command> = TCommand extends
  ComposedCommands<infer TCommands, infer TArgv> ? 
    & TArgv
    & IntersectOf<
      (ToUnion<TCommands> extends infer C
        ? C extends ComposedCommands ? _ComposeCommandsFlattenArgv<C> : {}
        : never)
    >
  : never;
