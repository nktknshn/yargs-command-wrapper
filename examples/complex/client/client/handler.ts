/* eslint-disable @typescript-eslint/require-await */
import { createHandlerFor, GetCommandArgv } from "../../../../src";
import { Address } from "../../common";
import { HandlerResult } from "../types";
import { cmd } from "./args";

const listHandler = (
  argv: { address: Address; path: string; debug: boolean },
): HandlerResult =>
async () => {
  console.log(
    `list ${argv.address.address}:${argv.address.port} at ${argv.path}`,
  );
};

const downloadHandler = (
  argv: { address: Address; files?: string[]; debug: boolean },
): HandlerResult =>
async () => {
  console.log(
    `download ${argv.address.address}:${argv.address.port} ${
      (argv.files ?? []).join(",")
    }`,
  );
};

const uploadHandler = (
  argv: GetCommandArgv<typeof cmd.$.upload>,
): HandlerResult =>
async () => {
  argv.debug;
  console.log(
    `upload ${argv.address.address}:${argv.address.port} ${
      argv.files.join(", ")
    } to ${argv.destination}`,
  );
};

export const handler = createHandlerFor(cmd, {
  list: listHandler,
  download: downloadHandler,
  upload: uploadHandler,
});
