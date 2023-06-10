import {
  CommandBasic,
  CommandComposed,
  CommandComposedWithSubcommands,
} from "../../../src/command";
import { EmptyRecord } from "../../../src/common/types";
import { InputHandlerRecordFor } from "../../../src/handler/create-handler-for/type-create-handler-for";

type BC1 = CommandBasic<"sub1">;
type BC2 = CommandBasic<"sub2">;
type CC1 = CommandComposed<[BC1, BC2], EmptyRecord, { selfHandle: true }>;
type SC1 = CommandComposedWithSubcommands<
  "c",
  [BC1, BC2],
  EmptyRecord,
  EmptyRecord,
  { selfHandle: true }
>;

describe("InputHandlerRecordFor", () => {
  test("composed", () => {
    type A = InputHandlerRecordFor<CC1>;

    expectTypeOf<A>().toMatchTypeOf<{
      "sub1": any;
      "sub2": any;
      "": any;
    }>();
  });

  test("subs", () => {
    type A = InputHandlerRecordFor<SC1>;

    expectTypeOf<A>().toMatchTypeOf<{
      "sub1": any;
      "sub2": any;
      "": any;
    }>();
  });
});
