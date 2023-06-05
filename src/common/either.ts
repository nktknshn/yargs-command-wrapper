export type Left<E> = { readonly _tag: "Left"; readonly left: E };
export type Right<A> = { readonly _tag: "Right"; readonly right: A };

/**
 * @description fp-ts compatible Either type.
 */
export type Either<E, A> = Left<E> | Right<A>;

/**
 * @description construct a Right value
 */
export const of = <E, A>(right: A): Either<E, A> => ({
  _tag: "Right",
  right,
});

/**
 * @description Is the value an error
 */
export const isLeft = <E, A>(either: Either<E, A>): either is Left<E> =>
  either._tag === "Left";

/**
 * @description Is the value a success value
 */
export const isRight = <E, A>(either: Either<E, A>): either is Right<A> =>
  either._tag === "Right";

/**
 * @description construct a Left value
 */
export const left = <E, A>(left: E): Either<E, A> => ({
  _tag: "Left",
  left,
});

/**
 * @description construct a Right value
 */
export const right = of;
