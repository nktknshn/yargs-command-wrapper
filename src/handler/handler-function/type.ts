import { EmptyRecord } from "../../common/types";

export type HandlerSyncType = "sync" | "async";

/**
 * @description handler for a command. It's just a function that receives a record of type `TArgv` and returns a value of type `TReturn`.
 */
export type HandlerFunction<
  // TArgs extends EmptyRecord = Record<string, never>,
  TArgs extends EmptyRecord = never,
  TType extends HandlerSyncType = HandlerSyncType,
  TReturn = unknown,
> = TType extends "sync" ? ((argv: TArgs) => TReturn)
  : ((argv: TArgs) => Promise<TReturn>);

// export type HandlerFunction = HandlerFunction<any>;

type F1 = HandlerFunction<{ a: number }, "sync", void>;
type IsExtends = F1 extends HandlerFunction<Record<string, never>> ? true
  : false;

type Ex2 = Record<never, never> extends Record<"a", number> ? true : false;
type Ex3 = { command: never; argv: never } extends
  { command: "a"; argv: { a: number } } ? true
  : false;
