import { EmptyRecord } from "../../../common/types";
import { SelfHandlerKey } from "../../../handler/create-handler-for/type-create-handler-for";
import { YargsCommandBuilder } from "../../types";
import { CommandBasic } from "../basic/type";
import { Command } from "../command";
import { AddArgv } from "../type-add-argv";
import { IsSelfHandled } from "../type-helpers";
import { CommandsFlatten, GetCommandName } from "./type-helpers";

/**
 * @description Properties of a command with subcommands.
 */
export type ComposedProps<TSelfHandle extends boolean = boolean> = {
  readonly selfHandle: TSelfHandle;
};

/**
 * @description composes multiple commands into a single command.
 */
export type CommandComposed<
  TCommands extends readonly Command[] = readonly Command[],
  TArgv extends EmptyRecord = EmptyRecord,
  TComposedProps extends ComposedProps = ComposedProps,
> = {
  readonly commands: TCommands;
  readonly builder?: YargsCommandBuilder<TArgv>;
  readonly props: TComposedProps;
  readonly type: "composed";
};

export type HelperCommands<
  TCommands extends readonly Command[],
  TArgv extends EmptyRecord,
  TComposedProps extends ComposedProps,
> = {
  readonly commands:
    & {
      [C in CommandsFlatten<TCommands> as GetCommandName<C>]:
        & C
        & AddArgv<C, TArgv>;
    }
    & (IsSelfHandled<TComposedProps> extends true
      ? { [SelfHandlerKey]: CommandBasic<SelfHandlerKey, TArgv> }
      : EmptyRecord);
};
