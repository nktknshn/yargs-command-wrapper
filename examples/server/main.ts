import { createMain } from "../../src/helpers";
import { cmd } from "./args";
import { handler } from "./handler";

export const main = createMain(cmd, handler);

if (require.main === module) {
  main();
}
