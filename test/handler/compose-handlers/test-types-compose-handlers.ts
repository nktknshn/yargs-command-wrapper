import { CommandBasic, CommandComposed } from "../../../src/command";
import { CommandArgs } from "../../../src/command/commands/args/type-command-args";
import { GetComposedCommandsNames } from "../../../src/command/commands/composed/type-helpers";
import { EmptyRecord } from "../../../src/common/types";
import { ComposableHandler } from "../../../src/handler/handler-composable/type-composable-handler";
import {
  ComposedHandlers,
  ComposeNames,
} from "../../../src/handler/handler-composable/types-compose";

type CC1 = CommandComposed<
  [CommandBasic<"a", EmptyRecord>, CommandBasic<"b", EmptyRecord>],
  EmptyRecord
>;

describe("composable handlers types", () => {
  test("get names", () => {
    type H1 = ComposableHandler<CommandArgs<EmptyRecord, "a">, "cmd1" | "cmd2">;
    type H2 = ComposableHandler<CommandArgs<EmptyRecord, "b">, "cmd3" | "cmd4">;

    type Names = ComposeNames<[H1, H2]>;

    type C1 = ComposedHandlers<[H1, H2]>;

    type Names2 = GetComposedCommandsNames<CC1>;
  });
});
