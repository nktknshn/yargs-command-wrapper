import { createHandlerFor } from "../../../../src";
import { cmd } from "./args";

/**
const handler: (
  args:
    | { command: "get"; argv: { key: string | undefined } }
    | { command: "set"; argv: { value: string; key: string } },
) => Promise<void>;
*/
export const handler = createHandlerFor(cmd, {
  "get": async ({ key }) => {
    console.log(`get client config ${key ?? "all"}`);
  },
  "set": async ({ key, value }) => {
    console.log(`set client config ${key} ${value}`);
  },
});
