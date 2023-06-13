/**
 * @description parses a command description and returns the command name
 * @param desc the command description
 * @returns the command name
 */
export const getCommandNameFromDesc = (desc: string): string => {
  desc = desc.trimStart();
  return desc.includes(" ")
    ? desc.split(" ")[0]
    : desc;
};
