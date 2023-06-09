import { expectTypeOf } from "expect-type";

import { command, composeCommands, subcommands } from "../../src";
import {
  CommandBasic,
  CommandComposedWithSubcommands,
  GetCommandArgs,
} from "../../src/command";
import { CommandArgsGeneric } from "../../src/command/commands/args/type-command-args-generic";
import { EmptyRecord } from "../../src/common/types";
import { ToList } from "../../src/common/types-util";

describe("mapped types", () => {
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

  test("pure types", () => {
    type C1 = CommandComposedWithSubcommands<
      "cmd2",
      [CommandBasic<"sub1", EmptyRecord>, CommandBasic<"sub2", EmptyRecord>],
      EmptyRecord,
      EmptyRecord,
      { selfHandle: true }
    >;

    type AC1 = GetCommandArgs<C1>;

    type AC1L = ToList<AC1>;

    expectTypeOf<AC1>().toEqualTypeOf<
      | CommandArgsGeneric<EmptyRecord, ["cmd2", "sub1"]>
      | CommandArgsGeneric<EmptyRecord, ["cmd2", "sub2"]>
      | CommandArgsGeneric<EmptyRecord, ["cmd2"]>
    >();

    type CC1 = CommandComposedWithSubcommands<
      "cmd1",
      [C1],
      EmptyRecord,
      EmptyRecord,
      { selfHandle: false }
    >;

    type A = GetCommandArgs<CC1>;

    expectTypeOf<A>().toEqualTypeOf<
      | CommandArgsGeneric<EmptyRecord, ["cmd1", "cmd2", "sub1"]>
      | CommandArgsGeneric<EmptyRecord, ["cmd1", "cmd2", "sub2"]>
      | CommandArgsGeneric<EmptyRecord, ["cmd1", "cmd2"]>
    >();
  });
});
