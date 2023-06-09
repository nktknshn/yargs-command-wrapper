import { expectTypeOf } from "expect-type";

import {
  command,
  composeCommands,
  HandlerFunctionFor,
  subcommands,
} from "../../src";
import {
  CommandBasic,
  CommandComposedWithSubcommands,
  GetCommandArgs,
} from "../../src/command";
import { CommandArgsGeneric } from "../../src/command/commands/args/type-command-args-generic";
import { EmptyRecord } from "../../src/common/types";

describe("mapped types", () => {
  test("composed args type", () => {
    const cmd = composeCommands(
      command("sub1", "desc"),
      command("sub2", "desc"),
    );

    expectTypeOf<typeof cmd["props"]>().toEqualTypeOf<{ selfHandle: false }>;

    expectTypeOf<GetCommandArgs<typeof cmd>>().toEqualTypeOf<
      | CommandArgsGeneric<EmptyRecord, ["sub1"]>
      | CommandArgsGeneric<EmptyRecord, ["sub2"]>
    >();
  });

  test("composed args self handled", () => {
    const cmd = composeCommands(
      command("sub1", "desc"),
      command("sub2", "desc"),
    ).$.selfHandle(true);

    expectTypeOf<typeof cmd["props"]>().toEqualTypeOf<{ selfHandle: true }>;

    type A = GetCommandArgs<typeof cmd>;

    expectTypeOf<GetCommandArgs<typeof cmd>>().toEqualTypeOf<
      | CommandArgsGeneric<EmptyRecord, ["sub1"]>
      | CommandArgsGeneric<EmptyRecord, ["sub2"]>
      | CommandArgsGeneric<EmptyRecord, [""]>
    >();

    const handler: HandlerFunctionFor<typeof cmd> = (args) => {
      if (args.command) {
        args.command;
      }
      else {
        args.command;
      }
    };
  });

  test("self handle composed args nested into subs", () => {
    const subsCmd = composeCommands(
      command("sub1", "desc"),
      command("sub2", "desc"),
    ).$.selfHandle(true);

    const cmd = subcommands("cmd1", "desc", subsCmd);

    type A = GetCommandArgs<typeof cmd>;

    expectTypeOf<A>().toEqualTypeOf<
      | CommandArgsGeneric<EmptyRecord, ["cmd1", "sub1"]>
      | CommandArgsGeneric<EmptyRecord, ["cmd1", "sub2"]>
      | CommandArgsGeneric<EmptyRecord, ["cmd1", ""]>
    >();
  });

  test("self handle composed args nested into self handled subs", () => {
    const subsCmd = composeCommands(
      command("sub1", "desc"),
      command("sub2", "desc"),
    ).$.selfHandle(true);

    const cmd = subcommands("cmd1", "desc", subsCmd).$.selfHandle(true);

    type A = GetCommandArgs<typeof cmd>;

    const a: A = {
      command: "cmd1",
      subcommand: "sub2",
      argv: {},
    };

    expectTypeOf<A>().toEqualTypeOf<
      | CommandArgsGeneric<EmptyRecord, ["cmd1", "sub1"]>
      | CommandArgsGeneric<EmptyRecord, ["cmd1", "sub2"]>
      | CommandArgsGeneric<EmptyRecord, ["cmd1", ""]>
      | CommandArgsGeneric<EmptyRecord, ["cmd1"]>
    >();
  });
});
