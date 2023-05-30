import {
  BasicCommand,
  Command,
  CommandWithSubcommands,
  ComposedCommands,
} from "../command/";
import { Cast, ToList, TupleKeys } from "../common/types-util";
import { CommandArgs, NestedCommandArgs } from "./types-handler";

/**
 * @description Traverses composed commands tree and returns command with given name
 */

export const findByNameInComposed = (
  commands: readonly Command[],
  name: string,
): BasicCommand | CommandWithSubcommands | undefined => {
  for (const command of commands) {
    if (command.type === "command") {
      if (command.commandName === name) {
        return command;
      }
    }
    else if (command.type === "composed") {
      const found = findByNameInComposed(command.commands, name);

      if (found) {
        return found;
      }
    }
    else {
      if (command.command.commandName === name) {
        return command;
      }
    }
  }

  return undefined;
};

export function composedCommandNames<TCommand extends ComposedCommands>(
  command: TCommand,
): string[] {
  const result: string[] = [];

  for (const c of command.commands) {
    if (c.type === "composed") {
      result.push(...composedCommandNames(c));
    }
    else if (c.type === "with-subcommands") {
      result.push(c.command.commandName);
    }
    else {
      result.push(c.commandName);
    }
  }

  return result;
}

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
