/* eslint-disable @typescript-eslint/require-await */
import { createHandlerFor } from "../../../../src";
import { HandlerResult } from "../types";
import { cmd } from "./args";

export const handler = createHandlerFor(cmd, {
  "get": ({ key }): HandlerResult => async () => {
    console.log(`get client config ${key ?? "all"}`);
  },
  "set": ({ key, value }): HandlerResult => async () => {
    console.log(`set client config ${key} ${value}`);
  },
});
