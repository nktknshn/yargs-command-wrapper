export type Left<E> = { readonly _tag: "Left"; readonly left: E };
export type Right<A> = { readonly _tag: "Right"; readonly right: A };

export type Either<E, A> = Left<E> | Right<A>;

export const of = <E, A>(right: A): Either<E, A> => ({
  _tag: "Right",
  right,
});

export const isLeft = <E, A>(either: Either<E, A>): either is Left<E> =>
  either._tag === "Left";

export const isRight = <E, A>(either: Either<E, A>): either is Right<A> =>
  either._tag === "Right";

export const left = <E, A>(left: E): Either<E, A> => ({
  _tag: "Left",
  left,
});

//

export const right = of;
