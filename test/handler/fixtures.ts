import { comm, comp, subs } from "../../src";
import { opt } from "../types/addOption";

export const com = <T extends string>(name: T) => comm(name, name);

export const com1 = comm("com1", "description", opt("a"));
export const com2 = comm("com2", "description", opt("c"));
export const com3 = comm("com3", "description", opt("d"));
export const com4 = comm("com4", "description", opt("d1"));
export const com5 = comm("com5", "description", opt("d2"));
export const com6 = comm("com6", "description", opt("d3"));
export const com7 = comm("com7", "description", opt("d4"));
export const com8 = comm("com8", "description", opt("d5"));
export const com9 = comm("com9", "description", opt("d6"));

export const com1com2 = comp(com1, com2);
export const com2com3 = comp(com2, com3);

export const sub1 = comm("sub1", "sub1", opt("sub1argv"));
export const sub2 = comm("sub2", "sub2", opt("sub2argv"));

const subsub1 = comm("subsub1", "subsub1", opt("subsub1argv"));
const subsub2 = comm("subsub2", "subsub2", opt("subsub2argv"));

export const s1s2comp = comp(subsub1, subsub2);

export const subsCommand = subs(comm("sub3", "sub3", opt("sub3argv")), [
  subsub1,
  subsub2,
]);
/**
 * @description com4: sub1 sub2 sub3
 */

export const deepNested = subs(
  comm("com4", "com4", opt("com4argv")),
  [sub1, sub2, subsCommand],
);

export const composedCommand = comp(com1, com2com3, deepNested);
