import { expectTypeOf } from "expect-type";

import {
  command,
  comp,
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
import { PushCommand } from "../../src/command/commands/args/type-push-command";
import {
  GetSubsSelfArgs,
} from "../../src/command/commands/with-subcommands/type-parse-result";
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
    ).selfHandle(true);

    expectTypeOf<typeof cmd["props"]>().toEqualTypeOf<{ selfHandle: true }>;

    type A = GetCommandArgs<typeof cmd>;

    expectTypeOf<GetCommandArgs<typeof cmd>>().toEqualTypeOf<
      | CommandArgsGeneric<EmptyRecord, ["sub1"]>
      | CommandArgsGeneric<EmptyRecord, ["sub2"]>
      | CommandArgsGeneric<EmptyRecord, [undefined]>
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
    ).selfHandle(true);

    const cmd = subcommands("cmd1", "desc", subsCmd);

    type A = GetCommandArgs<typeof cmd>;

    expectTypeOf<A>().toEqualTypeOf<
      | CommandArgsGeneric<EmptyRecord, ["cmd1", "sub1"]>
      | CommandArgsGeneric<EmptyRecord, ["cmd1", "sub2"]>
      | CommandArgsGeneric<EmptyRecord, ["cmd1", undefined]>
    > // | CommandArgsGeneric<EmptyRecord, ["cmd1", ""]>
    ();
  });

  test("self handle composed args nested", () => {
    const subsCmd = composeCommands(
      command("sub1", "desc"),
      command("sub2", "desc"),
    );

    const cmd1 = subcommands("cmd1", "desc", subsCmd)
      .selfHandle(true);

    const composedCmd1 = comp(cmd1, command("cmd2", "desc"));

    type ComposedCmd1Args = GetCommandArgs<typeof composedCmd1>;

    expectTypeOf<ComposedCmd1Args>().toEqualTypeOf<
      | CommandArgsGeneric<EmptyRecord, ["cmd1", "sub1"]>
      | CommandArgsGeneric<EmptyRecord, ["cmd1", "sub2"]>
      | CommandArgsGeneric<EmptyRecord, ["cmd1", undefined]>
      | CommandArgsGeneric<EmptyRecord, ["cmd2"]>
    >();

    type P = PushCommand<ComposedCmd1Args, "cmd3", {}>;

    const nestedComposedCmd1 = subcommands("cmd3", "desc", composedCmd1);

    type G = GetSubsSelfArgs<typeof nestedComposedCmd1>;

    type NestedCmd1Args = GetCommandArgs<typeof nestedComposedCmd1>;

    expectTypeOf<NestedCmd1Args>().toEqualTypeOf<
      | CommandArgsGeneric<EmptyRecord, ["cmd3", "cmd1", "sub1"]>
      | CommandArgsGeneric<EmptyRecord, ["cmd3", "cmd1", "sub2"]>
      | CommandArgsGeneric<EmptyRecord, ["cmd3", "cmd1", undefined]>
      | CommandArgsGeneric<EmptyRecord, ["cmd3", "cmd2"]>
    >();
  });

  test("self handle composed args nested into self handled subs", () => {
    const subsCmd = composeCommands(
      command("sub1", "desc"),
      command("sub2", "desc"),
    ).selfHandle(true);

    const cmd1 = subcommands("cmd1", "desc", subsCmd).selfHandle(true);

    type A = GetCommandArgs<typeof cmd1>;

    expectTypeOf<A>().toEqualTypeOf<
      | CommandArgsGeneric<EmptyRecord, ["cmd1", "sub1"]>
      | CommandArgsGeneric<EmptyRecord, ["cmd1", "sub2"]>
      // | CommandArgsGeneric<EmptyRecord, ["cmd1", ""]>
      | CommandArgsGeneric<EmptyRecord, ["cmd1", undefined]>
    >();

    type Z = CommandArgsGeneric<EmptyRecord, ["cmd1", undefined]>;

    const composedCmd1 = comp(
      cmd1,
      command("cmd2", "desc"),
    ).selfHandle(true);

    expectTypeOf<GetCommandArgs<typeof composedCmd1>>().toEqualTypeOf<
      | CommandArgsGeneric<EmptyRecord, ["cmd1", "sub1"]>
      | CommandArgsGeneric<EmptyRecord, ["cmd1", "sub2"]>
      // | CommandArgsGeneric<EmptyRecord, ["cmd1", ""]>
      | CommandArgsGeneric<EmptyRecord, ["cmd1", undefined]>
      | CommandArgsGeneric<EmptyRecord, ["cmd2"]>
      | CommandArgsGeneric<EmptyRecord, [undefined]>
    >();

    const nestedComposedCmd1 = subcommands(
      "cmd3",
      "desc",
      composedCmd1,
    ).selfHandle(true);

    expectTypeOf<typeof nestedComposedCmd1["props"]["selfHandle"]>()
      .toEqualTypeOf<true>();

    type B = GetCommandArgs<typeof nestedComposedCmd1>;

    const b: B = {
      command: "cmd3",
      subcommand: undefined,
      argv: {},
    };

    if (b.command === "cmd3") {
      b.subcommand;
    }

    expectTypeOf<B>().toEqualTypeOf<
      | CommandArgsGeneric<EmptyRecord, ["cmd3", "cmd1", "sub1"]>
      | CommandArgsGeneric<EmptyRecord, ["cmd3", "cmd1", "sub2"]>
      // | CommandArgsGeneric<EmptyRecord, ["cmd3", "cmd1", ""]>
      | CommandArgsGeneric<EmptyRecord, ["cmd3", "cmd1", undefined]>
      | CommandArgsGeneric<EmptyRecord, ["cmd3", "cmd2"]>
      // | CommandArgsGeneric<EmptyRecord, ["cmd3", ""]>
      | CommandArgsGeneric<EmptyRecord, ["cmd3", undefined]>
    >();

    const rootComp = comp(
      nestedComposedCmd1,
    ).selfHandle(true);

    expectTypeOf<GetCommandArgs<typeof rootComp>>().toEqualTypeOf<
      B | CommandArgsGeneric<EmptyRecord, [undefined]>
    >();
  });

  test("pure types", () => {
    type Cmd1 = CommandComposedWithSubcommands<
      "cmd1",
      [CommandBasic<"sub1">, CommandBasic<"sub2">],
      EmptyRecord,
      EmptyRecord,
      { selfHandle: true },
      { selfHandle: true }
    >;

    type AC1 = GetCommandArgs<Cmd1>;

    type Cmd3 = CommandComposedWithSubcommands<
      "cmd3",
      [CommandBasic<"cmd2">, Cmd1],
      EmptyRecord,
      EmptyRecord,
      { selfHandle: true },
      { selfHandle: true }
    >;

    type AC2 = GetCommandArgs<Cmd3>;

    expectTypeOf<AC2>().toEqualTypeOf<
      | CommandArgsGeneric<EmptyRecord, ["cmd3", "cmd1", "sub1"]>
      | CommandArgsGeneric<EmptyRecord, ["cmd3", "cmd1", "sub2"]>
      // | CommandArgsGeneric<EmptyRecord, ["cmd3", "cmd1", ""]>
      | CommandArgsGeneric<EmptyRecord, ["cmd3", "cmd1", undefined]>
      | CommandArgsGeneric<EmptyRecord, ["cmd3", "cmd2"]>
      // | CommandArgsGeneric<EmptyRecord, ["cmd3", ""]>
      | CommandArgsGeneric<EmptyRecord, ["cmd3", undefined]>
    >();
  });
});
