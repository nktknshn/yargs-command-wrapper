export type NestedCommandArgs<TArgv extends {} = {}> = {
  "subcommand": string;
  "command": string;
  "argv": TArgv;
};
