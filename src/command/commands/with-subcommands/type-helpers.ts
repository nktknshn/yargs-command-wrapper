import { CommandComposed } from "../composed/type";
import { CommandComposedWithSubcommands } from "./type";

export type GetNestedComposedCommand<
  TCommand extends CommandComposedWithSubcommands,
> = TCommand extends CommandComposedWithSubcommands<
  string,
  infer TCommands,
  infer TArgv,
  infer TComposedArgv
> ? CommandComposed<TCommands, TArgv & TComposedArgv>
  : never;
