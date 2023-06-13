import { createMain } from "../../../src/main";
import { cmd, handler } from "./";

const main = createMain(
  cmd,
  ({ args, yargs }) => handler.handle(args)({ yargs }),
);

if (require.main === module) {
  main().catch(console.error);
}
