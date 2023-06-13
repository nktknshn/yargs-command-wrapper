import { createMain } from "../../../src/main";
import { cmd } from "./args";
import { handler } from "./handler";

const main = createMain(
  cmd,
  ({ args, yargs }) => handler.handle(args)({ yargs }),
);

if (require.main === module) {
  main().catch(console.error);
}
