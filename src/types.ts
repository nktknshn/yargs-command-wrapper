import * as y from "yargs";
import { Cast, ToList, TupleKeys } from "./util";

export type Builder<TArgv> = (parent: y.Argv<{}>) => y.Argv<TArgv>;

export type GetCommandNameString<TCommandDesc extends string> =
  TCommandDesc extends `${infer TCommandName} ${string}` ? TCommandName
    : TCommandDesc;

export type GetCommandNameFromDesc<
  TCommandDesc extends readonly string[] | string,
> = TCommandDesc extends string ? GetCommandNameString<TCommandDesc>
  : GetCommandNameString<TCommandDesc[0]>;

export type GetSubcommands<T> = T extends { subcommand: infer C } ? C : never;
export type GetSubcommand<T, C extends GetSubcommands<T>> = T extends
  { subcommand: C } ? T : never;

export type BasicCommand<
  TCommandName extends string = string,
  TArgv extends {} = {},
> = {
  commandName: TCommandName;
  commandDesc: readonly string[];
  description: string;
  builder: Builder<TArgv>;
  type: "command";
};

export type CommandWithSubcommands<
  TCommandName extends string = string,
  TArgv extends {} = {},
  TCommands extends readonly Command[] = readonly Command[],
  TComposedArgv extends {} = {},
> = {
  command: BasicCommand<TCommandName, TArgv>;
  subcommands: ComposedCommands<TCommands, TComposedArgv>;
  type: "with-subcommands";
};

export type ComposedCommands<
  TCommands extends readonly Command[] = readonly Command[],
  TArgv extends {} = {},
> = {
  commands: TCommands;
  builder?: Builder<TArgv>;
  type: "composed";
};

export type Command =
  | BasicCommand<string, {}>
  | ComposedCommands<readonly Command[], {}>
  | CommandWithSubcommands<string, {}, readonly Command[]>;

type GetSingleReturnType<
  T extends BasicCommand<string, {}> = BasicCommand<string, {}>,
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

export type GetSubcommandsReturnType<
  TCommands extends readonly Command[],
  TCommandName extends string,
  TArgv,
  TGlobalArgv = {},
> = {
  [P in TupleKeys<TCommands>]: AddCommand<
    GetCommandReturnType<Cast<TCommands[P], Command>, TGlobalArgv>,
    TCommandName,
    TArgv
  >;
}[TupleKeys<TCommands>];

export type GetWithSubcommandsReturnType<
  T extends CommandWithSubcommands,
  TGlobalArgv = {},
> = T extends CommandWithSubcommands<
  infer TCommandName,
  infer TCommandArgv,
  infer TCommands
> ? GetSubcommandsReturnType<TCommands, TCommandName, TCommandArgv, TGlobalArgv>
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
