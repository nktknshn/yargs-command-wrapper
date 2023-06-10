import { CommandName } from "./type-command-args-generic";

export const pushCommand = (
  args: Record<string, unknown>,
  command: string,
) => {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(args)) {
    if (key == "argv") {
      result[key] = value;
    }
    else if (key.endsWith("command")) {
      result[`sub${key}`] = value;
    }
  }

  result["command"] = command;

  return result;
};

export const appendSubcommand = (
  args: Record<string, unknown>,
  subcommand: CommandName,
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  let longest = "command" in args ? "command" : "";

  for (const [key, value] of Object.entries(args)) {
    if (key == "argv") {
      result[key] = value;
    }
    else if (key.endsWith("command")) {
      if (key.length > longest.length) {
        longest = key;
      }
      result[key] = value;
    }
  }

  if (longest == "") {
    result["command"] = subcommand;
  }
  else {
    result[`sub${longest}`] = subcommand;
  }

  return result;
};
