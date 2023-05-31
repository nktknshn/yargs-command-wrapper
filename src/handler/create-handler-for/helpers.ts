import { CommandArgs } from "../../command/commands/composed/type-command-args";
import { NestedCommandArgs } from "../../command/commands/with-subcommands/type-nested-command-args";
import { Cast, ToList, TupleKeys } from "../../common/types-util";

export type PopCommand<T extends CommandArgs> = ToList<T> extends infer L ? {
    [P in TupleKeys<L>]:
      & Omit<L[P], "command">
      & {
        argv: Cast<L[P], CommandArgs>["argv"];
      }
      & {
        [K in keyof L[P] as K extends `sub${infer U}` ? U : never]: L[P][K];
      };
  }[TupleKeys<L>]
  : never;

export function popCommand<
  T extends NestedCommandArgs<TArgv>,
  TArgv extends {},
>(args: T): PopCommand<T>;

export function popCommand<
  T extends { command: string; argv: TArgv },
  TArgv extends {},
>(args: T): TArgv;

export function popCommand<
  T extends CommandArgs<TArgv>,
  TArgv extends {},
>(args: T): PopCommand<T> | TArgv {
  if (!("subcommand" in args as unknown)) {
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
      const value = args[key];
      const k = key.replace(/^sub/, "");
      result[k] = value;
    }
  }

  return result as PopCommand<T>;
}
