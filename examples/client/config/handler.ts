import { createHandlerFor } from "../../../src/handler";
import { cmd } from "./args";

/**
const handler: (
  args:
    | { command: "get"; argv: { key: string | undefined } }
    | { command: "set"; argv: { value: string; key: string } },
) => Promise<void>;
*/
export const handler = createHandlerFor(cmd, {
  "get": async (argv) => {
    console.log(`get config ${argv.key ?? "all"}`);
  },
  "set": async (argv) => {
    console.log(`set config ${argv.key} ${argv.value}`);
  },
});
