import { comm, comp } from "../../../../src";
import { parseAddress } from "../../common";
import { defaultConfigFile } from "../config/args";

export const commandList = comm(
  "list <address> [path]",
  "list files",
  _ =>
    _
      .positional("address", {
        type: "string",
        coerce: parseAddress,
        demandOption: true,
      })
      .positional("path", { type: "string", default: "/" }),
);

export const commandDownload = comm(
  "download <address> <files..>",
  "download files",
  _ =>
    _
      .positional("address", {
        type: "string",
        demandOption: true,
        coerce: parseAddress,
      })
      .positional("files", { type: "string", array: true }),
);

export const commandUpload = comm(
  "upload <address> <files..>",
  "upload files",
  _ =>
    _
      .positional("address", {
        type: "string",
        demandOption: true,
        coerce: parseAddress,
      })
      .positional("files", { type: "string", array: true, demandOption: true })
      .option("destination", { alias: "D", type: "string", default: "/" }),
);

export const cmd = comp(
  _ =>
    _.options({
      "debug": { alias: "d", type: "boolean", default: false },
      "configFile": {
        alias: "c",
        type: "string",
        default: defaultConfigFile,
      },
    }),
  commandList,
  commandDownload,
  commandUpload,
);
