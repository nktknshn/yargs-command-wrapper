import { EmptyRecord } from "../../../common/types";
import { Cast, IntersectOf } from "../../../common/types-util";
import { ToList, ToUnion } from "../../../common/types-util";
import {
  Command,
  CommandBasic,
  CommandComposed,
  CommandComposedWithSubcommands,
} from "../..";
import { NamedCommand } from "../command";

export type GetCommandsNames<TCommands extends readonly NamedCommand[]> =
  GetCommandName<Cast<ToUnion<CommandsFlattenList<TCommands>>, Command>>;

/**
 * @description Gets a union of all the composed commands names
 */
export type GetComposedCommandsNames<T extends CommandComposed> = T extends
  CommandComposed<infer TCommands>
  ? GetCommandsNames<CommandsFlattenList<TCommands>>
  : never;

/**
 * @description Gets the name of a command. For a composed command it returns `never`
 */
export type GetCommandName<TCommand extends Command> = TCommand extends
  CommandBasic<infer TName> ? TName
  : TCommand extends CommandComposed ? never
  : TCommand extends CommandComposedWithSubcommands<infer TName> ? TName
  : never;

/**
 * @description Excludes composed commands from a tree of commands leaving only the named commands (BasicCommand and CommandWithSubcommands)
 */
export type CommandsFlatten<TCommands extends readonly Command[]> = Cast<
  ToUnion<TCommands> extends infer C
    ? C extends CommandComposed ? _ComposeCommandsFlatten<C> : C
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
export type ComposeCommandsFlatten<TCommand extends Command> = CommandComposed<
  Cast<ToList<_ComposeCommandsFlatten<TCommand>>, readonly Command[]>,
  _ComposeCommandsFlattenArgv<TCommand>
>;

type _ComposeCommandsFlatten<TCommand extends Command> = TCommand extends
  CommandComposed<infer TCommands>
  ? ToUnion<TCommands> extends infer C
    ? C extends CommandComposed ? _ComposeCommandsFlatten<C> : C
  : never
  : never;

/**
 * @description Gets composed commands common Argv
 */
type _ComposeCommandsFlattenArgv<TCommand extends Command> = TCommand extends
  CommandComposed<infer TCommands, infer TArgv> ? 
    & TArgv
    & IntersectOf<
      (ToUnion<TCommands> extends infer C
        ? C extends CommandComposed ? _ComposeCommandsFlattenArgv<C>
        : EmptyRecord
        : never)
    >
  : never;
