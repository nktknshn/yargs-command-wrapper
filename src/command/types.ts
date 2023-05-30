import * as y from "yargs";
import { NonEmptyTuple } from "../common/types";
import { Command } from "./commands/command";

export type CommandsTuple = NonEmptyTuple<Command>;

export type YargsCommandBuilder<TArgv> = (parent: y.Argv<{}>) => y.Argv<TArgv>;
