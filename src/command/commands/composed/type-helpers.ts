import { Cast, IntersectOf } from "../../../common/types-util";
import { ToList, ToUnion } from "../../../common/types-util";
import {
  BasicCommand,
  Command,
  CommandWithSubcommands,
  ComposedCommands,
} from "../..";
import { NamedCommand } from "../command";

export type GetCommandsNames<TCommands extends readonly NamedCommand[]> =
  GetCommandName<Cast<ToUnion<CommandsFlattenList<TCommands>>, Command>>;

/**
 * @description Gets a union of all the composed commands names
 */
export type GetComposedCommandsNames<T extends ComposedCommands> = T extends
  ComposedCommands<infer TCommands>
  ? GetCommandsNames<CommandsFlattenList<TCommands>>
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
 * @description Excludes composed commands from a tree of commands leaving only the named commands (BasicCommand and CommandWithSubcommands)
 */
export type CommandsFlatten<TCommands extends readonly Command[]> = Cast<
  ToUnion<TCommands> extends infer C
    ? C extends ComposedCommands ? _ComposeCommandsFlatten<C> : C
    : never,
  NamedCommand
>;

/**
 * @description
 */
export type CommandsFlattenList<TCommands extends readonly Command[]> = Cast<
  ToList<CommandsFlatten<TCommands>>,
  readonly NamedCommand[]
>;

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
