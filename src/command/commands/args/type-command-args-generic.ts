import { EmptyRecord, NonEmptyTuple } from "../../../common/types";
import { Cast } from "../../../common/types-util";

/**
 * @description Generic type for result returned by a parser
 */
export type CommandArgsGeneric<
  TArgv extends EmptyRecord,
  TNames extends NonEmptyTuple<string | undefined>,
> =
  & { "argv": TArgv }
  & NamesToIntersection<TNames>;

export type NamesToIntersection<
  TNames extends NonEmptyTuple<string | undefined>,
> = _NamesToIntersect<TNames>;

type _NamesToIntersect<
  TNames extends readonly (string | undefined)[],
  TPrefix extends string = "",
> = TNames extends [] ? EmptyRecord
  : TNames extends readonly [infer TName, ...infer TRest] ? 
      & Record<`${TPrefix}command`, TName>
      & _NamesToIntersect<
        Cast<TRest, readonly (string | undefined)[]>,
        `sub${TPrefix}`
      >
  : never;

/**
 * @description Gets a tuple of all command names from args
 * @example
 * ```ts
 * type A = IntersectionToNames<{ command: "a"; subcommand: "b" }> // ["a", "b"]
 *
 * ```
 */
export type IntersectionToNames<
  TIntersection extends NamesToIntersection<[string | undefined]>,
> = _IntersectionToNames<TIntersection>;

type _IntersectionToNames<
  TIntersection extends Record<string, unknown>,
  TPrefix extends string = "",
> = Extract<keyof TIntersection, `${string}command`> extends never ? []
  : TIntersection extends Record<`${TPrefix}command`, infer TName> ? [
      TName,
      ..._IntersectionToNames<
        Omit<TIntersection, `${TPrefix}command`>,
        `sub${TPrefix}`
      >,
    ]
  : never;
