/* eslint-disable @typescript-eslint/require-await */
import { createHandlerFor, GetCommandArgv } from "../../../../src";
import { Address } from "../../common";
import { cmd } from "./args";

const listHandler = async (
  argv: { address: Address; path: string; debug: boolean },
) => {
  console.log(
    `list ${argv.address.address}:${argv.address.port} at ${argv.path}`,
  );
};

const downloadHandler = async (
  argv: { address: Address; files?: string[]; debug: boolean },
) => {
  console.log(
    `download ${argv.address.address}:${argv.address.port} ${
      (argv.files ?? []).join(",")
    }`,
  );
};

const uploadHandler = async (
  argv: GetCommandArgv<typeof cmd.$.commands.upload>,
) => {
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
