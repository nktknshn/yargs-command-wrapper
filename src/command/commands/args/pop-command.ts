import { EmptyRecord, NonEmptyTuple } from "../../../common/types";
import { Cast, ToList, TupleKeys } from "../../../common/types-util";
import { CommandArgs } from "./type-command-args";
import {
  CommandArgsGeneric,
  IntersectionToNames,
} from "./type-command-args-generic";
import { NestedCommandArgs } from "./type-nested-command-args";

/**
 * @description removes heading command
 */
export type PopCommandType<
  T extends CommandArgsGeneric<EmptyRecord, [string]>,
> = IntersectionToNames<T> extends [infer THead, ...infer TTail]
  ? TTail extends [] ? T["argv"]
  : CommandArgsGeneric<T["argv"], Cast<TTail, NonEmptyTuple<string>>>
  : never;

export function popCommand<
  T extends CommandArgsGeneric<TArgv, [string]>,
  TArgv extends EmptyRecord,
>(args: T): PopCommandType<T>;

export function popCommand(
  args: CommandArgsGeneric<EmptyRecord, [string]>,
): Record<string, unknown> {
  if (!("subcommand" in args)) {
    return args.argv;
  }

  const result: Record<string, unknown> = {
    argv: args.argv,
  };

  for (const key in args) {
    if (key === "command") {
      continue;
    }
    else if (/(sub)+command/.test(key)) {
      const value = args[key as keyof typeof args];
      const k = key.replace(/^sub/, "");
      result[k] = value;
    }
  }

  return result;
}
