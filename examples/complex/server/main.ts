import { createMain } from "../../../src/main";
import { cmd } from "./args";
import { handler } from "./handler";

const main = createMain(cmd, handler.handle);

if (require.main === module) {
  main().catch(console.error);
}
