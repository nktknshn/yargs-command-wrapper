/**
 * @description CommandArgs is the type of the argument that is passed to the handler
 */

import { EmptyRecord } from "../../../common/types";

export type CommandArgs<TArgv extends EmptyRecord = EmptyRecord> = {
  "command": string;
  "argv": TArgv;
};
