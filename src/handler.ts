import { AddCommand } from "./types";
import { Cast } from "./util";

type PathToObject<TPath extends string, TPrefix extends string = ""> =
  TPath extends `/${infer TName}/${infer TRest}` ? 
      & Record<`${TPrefix}command`, TName>
      & PathToObject<`/${TRest}`, `sub${TPrefix}`>
    : {};
export type GetArgs<TArgs, TPath extends string> = TArgs extends unknown
  ? TArgs extends PathToObject<TPath> ? TArgs : never
  : never;
export type Handler<TArgv> = (args: TArgv) => void;

type HandlersRecord = Record<string, Handler<any>>;

type HandlersUnion<T extends Record<string, Handler<any>>> = {
  [K in keyof T]: T[K] extends Handler<infer TArgs>
    ? TArgs extends { "command": string; argv: infer TArgv }
      ? AddCommand<TArgs, Cast<K, string>, {}>
    : { "command": K; argv: TArgs }
    : never;
}[keyof T];

export const createHandler = <T extends HandlersRecord>(
  record: T,
): Handler<HandlersUnion<T>> =>
(args) => {
  return record[args.command](args.argv);
};
