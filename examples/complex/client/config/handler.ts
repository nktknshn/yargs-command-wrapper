/* eslint-disable @typescript-eslint/require-await */
import { createHandlerFor } from "../../../../src";
import { cmd } from "./args";

export const handler = createHandlerFor(cmd, {
  "get": async ({ key }) => {
    console.log(`get client config ${key ?? "all"}`);
  },
  "set": async ({ key, value }) => {
    console.log(`set client config ${key} ${value}`);
  },
});
