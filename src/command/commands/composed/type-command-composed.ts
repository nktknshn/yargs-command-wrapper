import { EmptyRecord } from "../../../common/types";
import { YargsCommandBuilder } from "../../types";
import { Command } from "../command";
import { AddArgv } from "../type-add-argv";
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
> = {
  readonly commands: {
    [C in CommandsFlatten<TCommands> as GetCommandName<C>]:
      & C
      & AddArgv<C, TArgv>;
  };
};

export type HelperCommandCompose<
  TCommands extends readonly Command[],
  TArgv extends EmptyRecord,
  TComposedProps extends ComposedProps,
> =
  & HelperCommands<TCommands, TArgv>
  & {
    selfHandle: <B extends boolean>(value: B) => CommandComposed<
      TCommands,
      TArgv,
      { selfHandle: B }
    >;
  };
