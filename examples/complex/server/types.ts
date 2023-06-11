import { YargsObject } from "../../../src";

export type Deps = {
  yargs: YargsObject;
};

export type HandlerResult = (deps: Deps) => Promise<void>;
