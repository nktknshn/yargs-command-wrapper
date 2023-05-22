import {
  addSubcommands,
  buildAndParse,
  command,
  composeCommands,
  Either,
} from "../src";

async function main() {
  const { yargs, result } = buildAndParse(
    composeCommands(
      _ => _.option("debug", { type: "boolean", default: false }),
      command(
        "get [items..]",
        "get items",
        _ => _.positional("items", { array: true, type: "string" }),
      ),
      command("create", "create items"),
      command("list", "list items"),
    ),
  );

  if (Either.isLeft(result)) {
    yargs.showHelp();
    console.error();
    console.error(result.left.message);
    process.exit(1);
  }

  if (result.right.command === "get") {
    result.right.argv.items;
    result.right.argv.debug;
  }
  else if (result.right.command === "create") {
  }
  else if (result.right.command === "list") {
  }
}

main();
