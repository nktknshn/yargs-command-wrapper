import { SelfHandledU } from "../type-helpers";
import { CommandComposedWithSubcommands } from "./type-subs";

export type GetSubsPropsUnion<T extends CommandComposedWithSubcommands> =
  T extends CommandComposedWithSubcommands<
    infer TCommandName,
    infer TCommands,
    infer TCommandArgv,
    infer TComposedArgv,
    infer TProps,
    infer TComposedProps
  > ? SelfHandledU<TProps, TComposedProps>
    : never;
