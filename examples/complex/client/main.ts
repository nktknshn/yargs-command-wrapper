import { createMain } from "../../../src/helpers";
import { cmd, handler } from "./";

const main = createMain(cmd, handler.handle);

if (require.main === module) {
  main();
}
