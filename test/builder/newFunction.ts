import { EmptyRecord } from "../../src/common/types";

export function newFunction() {
  type Z =
    | { command: "cmd1"; subcommand: "sub1"; argv: EmptyRecord }
    | { command: "cmd1"; subcommand: "sub2"; argv: EmptyRecord }
    | { command: "cmd2"; argv: EmptyRecord };

  const Z: Z = {
    command: "cmd2",
    subcommand: "sub1",
    argv: {},
  };
}
