import { createHandler, GetArgv } from "../../src";
import { Address } from "../common";
import { commandDownload, commandList, commandUpload } from "./args";
import * as config from "./config/";

const listHandler = async (argv: { address: Address; path: string }) => {
  console.log(
    `list ${argv.address.address}:${argv.address.port} at ${argv.path}`,
  );
};

const downloadHandler = async (
  argv: { address: Address; files?: string[] },
) => {
  console.log(
    `download ${argv.address.address}:${argv.address.port} ${argv.files}`,
  );
};

const uploadHandler = async (argv: GetArgv<typeof commandUpload>) => {
  console.log(
    `upload ${argv.address.address}:${argv.address.port} ${argv.files} to ${argv.destination}`,
  );
};

export const handler = createHandler({
  "list": listHandler,
  "download": downloadHandler,
  "upload": uploadHandler,
  "config": config.handler,
});
