import { BasicCommand, ComposedCommands } from "../../src/types";

type A = ComposedCommands<[
  ComposedCommands<[
    BasicCommand<"command1", { c1: number }>,
    BasicCommand<"command2", { c2: number }>,
  ], { aa: number }>,
  ComposedCommands<[
    BasicCommand<"command3", { c3: number }>,
    BasicCommand<"command4", { c4: number }>,
  ], { bb: number }>,
], { a: number }>;
