import {
  Command,
  CommandComposed,
  CommandComposedWithSubcommands,
  GetCommandArgs,
} from "..";
import { ComposedProps } from "./composed/type-command-composed";
import { SubsProps } from "./with-subcommands/type";

/**
 * @description Gets command's handler args type
 */
export type GetCommandArgv<TCommand extends Command> = GetCommandArgs<
  TCommand
>["argv"];

export type IsSelfHandled<
  T extends
    | CommandComposed
    | CommandComposedWithSubcommands
    | SubsProps
    | ComposedProps,
> = T extends { selfHandle: infer B } ? B
  : T extends CommandComposedWithSubcommands | CommandComposed
    ? T["props"]["selfHandle"]
  : never;
