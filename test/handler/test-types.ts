import { createHandlerFor } from "../../src";
import { Command } from "../../src/command";
import { InputHandlerRecordForCommands } from "../../src/handler/create-handler-for/type-handler-for";
import { GetSyncType } from "../../src/handler/create-handler-for/type-helpers";
import { InputHandlerFunctionFor } from "../../src/handler/create-handler-for/type-input-function";
import { com1, com2, com2com3 } from "./test-create-handler-for";

describe("test handler types", () => {
  test("test input record", async () => {
    const a: InputHandlerRecordForCommands<typeof com2com3.commands, {}> = {
      "com2": (args) => {},
      "com3": (args) => {},
    };

    const h = (args: { a: string }) => 1;

    type H = (args: { a: string }) => number;

    type HS = GetSyncType<H>;

    type C = InputHandlerFunctionFor<Command>;

    const com1handler = createHandlerFor(com1, h);
    const com2handler = createHandlerFor(com2, (args) => "123");

    type A = H extends InputHandlerFunctionFor<typeof com1> ? 1 : 2;
  });
});
