import { CommandComposed } from "../composed/type";
import { CommandComposedWithSubcommands } from "./type";

export type GetNestedComposedCommand<
  TCommand extends CommandComposedWithSubcommands,
> = TCommand extends CommandComposedWithSubcommands<
  infer TName,
  infer TCommands,
  infer TArgv,
  infer TComposedArgv
> ? CommandComposed<TCommands, TArgv & TComposedArgv>
  : never;
