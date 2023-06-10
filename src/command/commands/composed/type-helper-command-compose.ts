import { EmptyRecord } from "../../../common/types";
import { SelfHandlerKey } from "../../../handler/create-handler-for/type-create-handler-for";
import { CommandsTuple } from "../../types";
import { CommandBasic } from "../basic/type";
import { Command } from "../command";
import { IsSelfHandled } from "../type-helpers";
import { ComposeCommandsResult } from "./compose-commands";
import {
  CommandComposed,
  ComposedProps,
  HelperCommands,
} from "./type-command-composed";

export type HelperCommandCompose<
  TCommands extends CommandsTuple,
  TArgv extends EmptyRecord,
  TComposedProps extends ComposedProps,
> =
  & HelperCommands<TCommands, TArgv, TComposedProps>
  & {
    /**
     * @description this command will handle the lack of subcommands.
     * no `demandCommand(1)` will be called for this command
     */
    selfHandle: <B extends boolean>(value: B) => ComposeCommandsResult<
      TCommands,
      TArgv,
      { selfHandle: B }
    >;
  };
