import { createHandlerFor } from "../../src";
import { Command } from "../../src/command";
import {
  InputHandlerRecordFor,
  InputHandlerRecordForCommands,
} from "../../src/handler/create-handler-for/type-create-handler-for";
import { GetSyncType } from "../../src/handler/create-handler-for/type-helpers";
import { InputHandlerFunctionFor } from "../../src/handler/create-handler-for/type-input-function";
import { com1, com1com2, com2, com2com3 } from "./fixtures";

describe("test handler types", () => {
  test("test input record", async () => {
    const a: InputHandlerRecordForCommands<typeof com2com3.commands, {}> = {
      com2: (args) => 1,
      com3: (args) => 2,
    };

    const h = (args: { a: string }) => 1;

    type H = (args: { a: string }) => number;

    type HS = GetSyncType<H>;

    type C = InputHandlerFunctionFor<Command>;

    // const hr:
    //   | InputHandlerRecordFor<typeof com1com2>
    //   | InputHandlerFunctionFor<typeof com1com2> = {};

    const com1handler = createHandlerFor(com1, h);
    const com2handler = createHandlerFor(com2, (args) => "123");

    const com1com2handler = createHandlerFor(
      com1com2,
      {
        com1: (args) => 1,
        com2: (args) => 2,
      },
    );

    type A = H extends InputHandlerFunctionFor<typeof com1> ? 1 : 2;
  });
});
