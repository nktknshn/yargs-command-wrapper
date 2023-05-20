import * as y from "yargs";
import { Cast, ToList, TupleKeys } from "./util";

export type Builder<TArgv> = (parent: y.Argv<unknown>) => y.Argv<TArgv>;

export type GetCommandNameString<TCommandDesc extends string> =
  TCommandDesc extends `${infer TCommandName} ${string}` ? TCommandName
    : TCommandDesc;

export type GetCommandName<TCommandDesc extends readonly string[] | string> =
  TCommandDesc extends string ? GetCommandNameString<TCommandDesc>
    : GetCommandNameString<TCommandDesc[0]>;

export type GetSubcommands<T> = T extends { subcommand: infer C } ? C : never;
export type GetSubcommand<T, C extends GetSubcommands<T>> = T extends
  { subcommand: C } ? T : never;

export type BasicCommand<
  TCommandName extends string = string,
  TArgv = unknown,
> = {
  commandName: TCommandName;
  commandDesc: readonly string[];
  description: string;
  builder: Builder<TArgv>;
  type: "command";
};

export type CommandWithSubcommands<
  TCommandName extends string = string,
  TArgv = unknown,
  TCommands extends Command[] = Command[],
> = {
  command: BasicCommand<TCommandName, TArgv>;
  subcommands: ComposedCommands<TCommands>;
  type: "with-subcommands";
};

export type ComposedCommands<
  TCommands extends Command[] = Command[],
  TArgv = {},
> = {
  commands: TCommands;
  builder?: Builder<TArgv>;
  type: "composed";
};

export type Command =
  | BasicCommand<string, unknown>
  | ComposedCommands<Command[], {}>
  | CommandWithSubcommands<string, unknown, Command[]>;

type GetSingleReturnType<
  T extends BasicCommand<string, unknown> = BasicCommand<string, unknown>,
  TGlobalArgv = {},
> = T extends BasicCommand<infer C, infer R>
  ? { command: C; argv: R & TGlobalArgv }
  : never;

type GetComposedReturnType<
  T extends ComposedCommands = ComposedCommands,
  TGlobalArgv = {},
> = T extends ComposedCommands<infer CS, infer TGlobalArgvComposed> ? {
    [P in TupleKeys<CS>]: GetCommandReturnType<
      Cast<CS[P], Command>,
      TGlobalArgv & TGlobalArgvComposed
    >;
  }[TupleKeys<CS>]
  : never;

export type GetCommandsReturnType<
  CS extends Command[],
  C extends string,
  TArgv,
  TGlobalArgv = {},
> = {
  [P in TupleKeys<CS>]: AddCommand<
    GetCommandReturnType<Cast<CS[P], Command>, TGlobalArgv>,
    C,
    TArgv
  >;
}[TupleKeys<CS>];

export type GetWithSubcommandsReturnType<
  T extends CommandWithSubcommands,
  TGlobalArgv = {},
> = T extends CommandWithSubcommands<
  infer C,
  infer R,
  infer Commands
> ? GetCommandsReturnType<Commands, C, R, TGlobalArgv>
  : never;

export type GetCommandReturnType<TCommand extends Command, TGlobalArgv = {}> =
  TCommand extends BasicCommand ? GetSingleReturnType<TCommand, TGlobalArgv>
    : TCommand extends ComposedCommands
      ? GetComposedReturnType<TCommand, TGlobalArgv>
    : TCommand extends CommandWithSubcommands
      ? GetWithSubcommandsReturnType<TCommand, TGlobalArgv>
    : never;

/** shifts presenting commands with sub prefix */
export type AddCommand<T, C extends string, TArgv> = ToList<T> extends infer TS
  ? {
    [P in TupleKeys<TS>]:
      & Record<"command", C>
      & Pick<TS[P], Exclude<keyof TS[P], `${string}command`>>
      & {
        [
          P2 in keyof TS[P] as P2 extends `${string}command` ? `sub${P2}`
            : never
        ]: TS[P][P2];
      }
      & { argv: TArgv };
  }[TupleKeys<TS>]
  : never;
