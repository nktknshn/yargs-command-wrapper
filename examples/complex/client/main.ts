import { createMain } from "../../../src/main";
import { cmd, handler } from "./";

const { handle } = handler;
handler.handle;
const main = createMain(cmd, handle);

if (require.main === module) {
  main().catch(console.error);
}
