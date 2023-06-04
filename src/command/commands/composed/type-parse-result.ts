import { EmptyRecord } from "../../../common/types";
import { Cast, FallbackNever, TupleKeys } from "../../../common/types-util";
import { CommandArgs } from "../args/type-command-args";
import { Command } from "../command";
import { GetCommandArgs } from "../type-parse-result";
import { CommandComposed } from "./type";

/**
 * @description Get the parsing result of a composed command.
 */
export type GetComposedCommandArgs<
  T extends CommandComposed = CommandComposed,
  TGlobalArgv = EmptyRecord,
> = FallbackNever<
  T extends CommandComposed<infer CS, infer TGlobalArgvComposed> ? {
      [P in TupleKeys<CS>]: GetCommandArgs<
        Cast<CS[P], Command>,
        TGlobalArgv & TGlobalArgvComposed
      >;
    }[TupleKeys<CS>]
    : never,
  // Note: It is supposed to return never when the commands list is empty. But
  // api forbids creating empty commands list. So we fallback to `CommandArgs` here because the composed command will resolve to `CommandArgs` eventually anyway.
  CommandArgs
>;

// type A = GetComposedParseResult<ComposedCommands<>>;
