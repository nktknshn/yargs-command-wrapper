import {
  buildAndParseUnsafeR,
  comm,
  comp,
  composeHandlers,
  createHandlerFor,
  subs,
} from "../../../src";
import { opt } from "../../types/addOption";
import { com } from "../fixtures";

const clientArgs = comp(
  opt("debug"),
  com("list"),
  com("download"),
  com("upload"),
);

const configArgs = comp(
  opt("file"),
  com("get"),
  com("set"),
);

const cmd = comp(
  subs("config", "config", configArgs).selfHandle(true),
  clientArgs,
);

describe("complex example test", () => {
  test("compose handlers", () => {
    const clientHandler = createHandlerFor(clientArgs, args => {});
    const configHandler = createHandlerFor(configArgs, args => {});

    const configSubHandler = createHandlerFor(
      cmd.$.config,
      composeHandlers(
        createHandlerFor(cmd.$.config.$.$self, args => {}),
        configHandler,
      ),
    );

    const cmdHandler = composeHandlers(
      clientHandler,
      configSubHandler,
    );

    const result = buildAndParseUnsafeR(cmd, []);

    cmdHandler.handle(result);
  });
});
