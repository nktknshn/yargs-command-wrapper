import { CommandBasic, CommandComposed } from "../../../src/command";
import { CommandArgsSelfHandle } from "../../../src/command/commands/args/type-command-args";
import { CommandComposedImpl } from "../../../src/command/commands/composed/type-command-composed-class";
import { IsSelfHandled } from "../../../src/command/commands/type-helpers";
import { ComposableHandler } from "../../../src/handler/handler-composable/type-composable-handler";
import { ComposableHandlerFor } from "../../../src/handler/handler-composable/type-composable-handler-for";

type CC1Impl = CommandComposedImpl<
  [
    CommandBasic<"sub1", { sub1argv: string }>,
    CommandBasic<"sub2", { sub2argv: string }>,
  ],
  { cmd1argv: string },
  { selfHandle: true }
>;

describe("self handle related types", () => {
  test("IsSelfHandled", () => {
  });

  test("ComposableHandlerFor", () => {
    type H1 = {
      sub1: (args: { sub1argv: string; cmd1argv: string }) => void;
      sub2: (args: { sub2argv: string; cmd1argv: string }) => void;
      $sefl: (args: { cmd1argv: string }) => void;
    };

    type CH = ComposableHandlerFor<CC1Impl, "sync", void>;

    expectTypeOf<CH>().toEqualTypeOf<
      ComposableHandler<
        | { command: "sub1"; argv: { sub1argv: string; cmd1argv: string } }
        | {
          command: "sub2";
          argv: { sub2argv: string; cmd1argv: string };
        }
        | CommandArgsSelfHandle<{ cmd1argv: string }>,
        "sub2" | "sub1" | "$self",
        "sync",
        void
      >
    >();
  });
});
