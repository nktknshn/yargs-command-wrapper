import {
  comm,
  composeHandlers,
  createHandlerFor,
  GetArgv,
  subs,
} from "../../../src";
import { shiftCommand } from "../../../src/handler";
import { Address } from "../common";
import { commandDownload, commandList, commandUpload } from "./args";
import * as config from "./config";

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
    `download ${argv.address.address}:${argv.address.port} ${argv.files}`,
  );
};

const uploadHandler = async (argv: GetArgv<typeof commandUpload>) => {
  console.log(
    `upload ${argv.address.address}:${argv.address.port} ${argv.files} to ${argv.destination}`,
  );
};

export const handler = composeHandlers({
  "list": listHandler,
  "download": downloadHandler,
  "upload": uploadHandler,
  "config": config.handler,
});

const configHandler = createHandlerFor(
  subs(comm("config", "config management"), config.cmd),
  (args) => {
    const a = shiftCommand(args);
    type B = typeof a["argv"];
    a.command;
    config.handler(a);
  },
);
