import { createMain } from "../../../src/main";
import { cmd, handler } from "./";

const main = createMain(cmd, handler.handle);

if (require.main === module) {
  main();
}
