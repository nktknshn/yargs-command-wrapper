/**
 * @description CommandArgs is the type of the argument that is passed to the handler
 */

export type CommandArgs<TArgv extends {} = {}> = {
  "command": string;
  "argv": TArgv;
};
