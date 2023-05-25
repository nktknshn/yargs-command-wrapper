import yargs from "yargs";

export const opt =
  <TName extends string>(name: TName) => <T>(_: yargs.Argv<T>) =>
    _.option(name, { type: "string", demandOption: true });
