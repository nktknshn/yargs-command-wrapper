import { YargsObject } from "../../../src";

export type Dep = {
  yargs: YargsObject;
};

export type HandlerResult = (deps: Dep) => Promise<void>;
