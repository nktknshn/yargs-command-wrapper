import { ToList, TupleKeys } from "../../../common/types-util";

/**
 * @description
 */
export type PushCommand<T, C extends string, TArgv> = ToList<T> extends infer TS
  ? {
    [P in TupleKeys<TS>]:
      & Record<"command", C>
      & Pick<TS[P], Exclude<keyof TS[P], `${string}command`>>
      & {
        [
          P2 in keyof TS[P] as P2 extends `${string}command` ? `sub${P2}`
            : never
        ]: TS[P][P2];
      }
      & { argv: TArgv };
  }[TupleKeys<TS>]
  : never;

// type A1 = PushCommand<{ argv: { a: number } }, "command1", {}>;
