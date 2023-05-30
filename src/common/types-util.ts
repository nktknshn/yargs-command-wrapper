export type TupleKeys<T> = Exclude<keyof T, keyof []>;
// from https://github.com/millsp/ts-toolbelt

export type ToList<U> = [U] extends [never] ? []
  : readonly [Last<U>, ...ToList<Exclude<U, Last<U>>>];

export type ToUnion<L> = L extends readonly [infer A, ...infer B]
  ? A | ToUnion<B>
  : never;

export type ListHead<L> = L extends readonly [infer A, ...infer _] ? A : never;

export type Last<U extends any> = IntersectOf<
  U extends unknown // Distribute U
    ? (x: U) => void
    : never // To intersect
> extends (x: infer P) => void ? P // Extract merged
  : never; // ^^^ Last parameter

export type IntersectOf<U extends any> =
  (U extends unknown ? (k: U) => void : never) extends ((k: infer I) => void)
    ? I
    : never;

export type Cast<A1 extends unknown, A2 extends unknown> = A1 extends A2 ? A1
  : A2;

export type TupleToUnion<T extends ReadonlyArray<unknown>> = T[number];

export type FallbackNever<T, U> = [T] extends [never] ? U : T;
