# About

This wrapper allows to separate args parsing from their handling in a functional and
a typesafe way.

# Usage

```typescript
import {
  addSubcommands,
  buildAndParse,
  command,
  composeCommands,
  Either,
} from "yargs-command-wrapper";

const cmd = composeCommands(
  _ => _.option("debug", { type: "boolean", default: false }),
  addSubcommands(
    command("server", "server management"),
    [
      command("start", "start server"),
      command("stop", "stop server"),
      addSubcommands(
        command("config", "config management"),
        [
          command("list", "list config"),
          command("set", "set config"),
        ],
      ),
    ],
  ),
  addSubcommands(
    command("client", "client management"),
    [
      command("list", "list files"),
      command("download", "download files"),
      command("upload", "upload files"),
      addSubcommands(
        command("config", "config management"),
        [
          command("list", "list config"),
          command("set", "set config"),
        ],
      ),
    ],
  ),
);

const { result, yargs } = buildAndParse(cmd);

if (Either.isLeft(result)) {
  yargs.showHelp();
  console.error();
  console.error(result.left.message);
  process.exit(1);
}

if (result.right.command === "server") {
}
else if (result.right.command === "client") {
}
```
