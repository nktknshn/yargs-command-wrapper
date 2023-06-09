import { expectTypeOf } from "expect-type";

import {
  command,
  composeCommands,
  HandlerFunctionFor,
  subcommands,
} from "../../src/";
import {
  Command,
  CommandBasic,
  CommandComposed,
  CommandComposedWithSubcommands,
} from "../../src/command/";
import { GetCommandArgs, GetComposedParseResult } from "../../src/command/";
import { CommandArgsGeneric } from "../../src/command/commands/args/type-command-args-generic";
import { PushCommand } from "../../src/command/commands/args/type-push-command";
import {
  CommandsFlattenList,
  ComposeCommandsFlatten,
} from "../../src/command/commands/composed/type-helpers";
import {
  GetSubcommandsArgs,
  GetSubcommandsParseResult,
} from "../../src/command/commands/with-subcommands/type-parse-result";
import { EmptyRecord } from "../../src/common/types";
import { InputHandlerRecordFor } from "../../src/handler/create-handler-for/type-create-handler-for";
import { HandlerFunction } from "../../src/handler/handler-function/type";
import { com } from "../handler/fixtures";

describe("mapped types", () => {
  test("flatten composed", async () => {
    type L = [
      CommandComposed<[
        CommandComposed<[
          CommandBasic<"command1", { c1: number }>,
          CommandBasic<"command2", { c2: number }>,
        ], { aa: number }>,
        CommandComposed<[
          CommandBasic<"command3", { c3: number }>,
          CommandBasic<"command4", { c4: number }>,
          CommandComposed<[
            CommandBasic<"command5", { c5: number }>,
            CommandBasic<"command6", { c6: number }>,
          ], { bb: number }>,
        ], { bb: number }>,
      ], { a: number }>,
    ];

    type LF = CommandsFlattenList<L>;

    type A = CommandComposed<L>;

    type B = ComposeCommandsFlatten<A>;
    type Commands = B extends CommandComposed<infer C, infer D> ? C : never;
    type Argv = B extends CommandComposed<infer C, infer D> ? D : never;

    expectTypeOf({} as Commands).toEqualTypeOf<
      readonly [
        CommandBasic<"command6", { c6: number }>,
        CommandBasic<"command5", { c5: number }>,
        CommandBasic<"command4", { c4: number }>,
        CommandBasic<"command3", { c3: number }>,
        CommandBasic<"command2", { c2: number }>,
        CommandBasic<"command1", { c1: number }>,
      ]
    >();

    expectTypeOf({} as Argv).toEqualTypeOf<
      { a: number; aa: number; bb: number }
    >();
  });

  test("InputRecordHandlerFor", () => {
    type B = InputHandlerRecordFor<Command>;
    type A = HandlerFunctionFor<Command>;
    type C = GetCommandArgs<Command>;
    // type D = HandlerFunction<
    //   PushCommand<Command, string, {}>
    // >;

    type E<T extends Command> = T extends CommandComposed<infer C, infer D>
      ? HandlerFunction<GetCommandArgs<CommandComposed<C>>>
      : never;

    type EE = E<Command>;

    type HH = GetComposedParseResult<CommandComposed>;
  });

  test("type subcommands parse result", () => {
    const cmd = subcommands("cmd", "desc", [
      command("sub1", "desc"),
      command("sub2", "desc"),
    ]);

    type A = GetCommandArgs<typeof cmd>;

    expectTypeOf<typeof cmd["props"]>().toEqualTypeOf<{ selfHandle: false }>;

    expectTypeOf<GetCommandArgs<typeof cmd>>().toEqualTypeOf<
      | CommandArgsGeneric<EmptyRecord, ["cmd", "sub1"]>
      | CommandArgsGeneric<EmptyRecord, ["cmd", "sub2"]>
    >();
  });

  test("type subcommands parse result", () => {
    const cmd = subcommands("cmd", "desc", [
      command("sub1", "desc"),
      command("sub2", "desc"),
    ]).$.selfHandle(true);

    expectTypeOf<typeof cmd["props"]>().toEqualTypeOf<{ selfHandle: true }>;

    type A = GetCommandArgs<typeof cmd>;

    expectTypeOf<GetCommandArgs<typeof cmd>>().toEqualTypeOf<
      | CommandArgsGeneric<EmptyRecord, ["cmd", "sub1"]>
      | CommandArgsGeneric<EmptyRecord, ["cmd", "sub2"]>
      | CommandArgsGeneric<EmptyRecord, ["cmd"]>
    >();

    type Z = CommandComposedWithSubcommands<
      "cmd",
      [CommandBasic<"sub1", EmptyRecord>, CommandBasic<"sub2", EmptyRecord>],
      EmptyRecord,
      EmptyRecord,
      { selfHandle: true }
    >;

    expectTypeOf<GetCommandArgs<Z>>().toEqualTypeOf<
      | CommandArgsGeneric<EmptyRecord, ["cmd", "sub1"]>
      | CommandArgsGeneric<EmptyRecord, ["cmd", "sub2"]>
      | CommandArgsGeneric<EmptyRecord, ["cmd"]>
    >();
  });

  test("self handle subcommands args", () => {
    const subsCmd = subcommands("cmd", "desc", [
      command("sub1", "desc"),
      command("sub2", "desc"),
    ]).$.selfHandle(true);

    const cmd = composeCommands(
      subsCmd,
      command("cmd2", "desc"),
    );

    type A = GetCommandArgs<typeof cmd>;

    expectTypeOf<A>().toEqualTypeOf<
      | CommandArgsGeneric<EmptyRecord, ["cmd", "sub1"]>
      | CommandArgsGeneric<EmptyRecord, ["cmd", "sub2"]>
      | CommandArgsGeneric<EmptyRecord, ["cmd"]>
      | CommandArgsGeneric<EmptyRecord, ["cmd2"]>
    >();
  });

  test("self handle subcommands args nested", () => {
    const subsCmd = subcommands("cmd2", "desc", [
      command("sub1", "desc"),
      command("sub2", "desc"),
    ]).$.selfHandle(true);

    const cmd = subcommands(
      "cmd1",
      "desc",
      [subsCmd, command("cmd3", "desc")],
    );

    type A = GetCommandArgs<typeof cmd>;

    expectTypeOf<A>().toEqualTypeOf<
      | CommandArgsGeneric<EmptyRecord, ["cmd1", "cmd2", "sub1"]>
      | CommandArgsGeneric<EmptyRecord, ["cmd1", "cmd2", "sub2"]>
      | CommandArgsGeneric<EmptyRecord, ["cmd1", "cmd2"]>
      | CommandArgsGeneric<EmptyRecord, ["cmd1", "cmd3"]>
    >();

    const cmd2 = cmd.$.selfHandle(true);

    expectTypeOf<GetCommandArgs<typeof cmd2>>().toEqualTypeOf<
      | CommandArgsGeneric<EmptyRecord, ["cmd1", "cmd2", "sub1"]>
      | CommandArgsGeneric<EmptyRecord, ["cmd1", "cmd2", "sub2"]>
      | CommandArgsGeneric<EmptyRecord, ["cmd1", "cmd2"]>
      | CommandArgsGeneric<EmptyRecord, ["cmd1", "cmd3"]>
      | CommandArgsGeneric<EmptyRecord, ["cmd1"]>
    >();
  });
});
