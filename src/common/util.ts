import { TupleToUnion } from "./types-util";

export type ObjectType = {};

export const isPromiseLike = <T>(a: unknown): a is PromiseLike<T> => {
  return (
    isObjectWithOwnProperty(a, "then")
    && typeof a.then === "function"
  );
};

export const replicate = <T>(n: number, x: T): T[] => {
  const result: T[] = [];

  for (let i = 0; i < n; i++) {
    result.push(x);
  }

  return result;
};

export function isObject(a: unknown): a is ObjectType {
  return typeof a === "object" && a !== null;
}

export function hasOwnProperty<X extends ObjectType, Y extends PropertyKey>(
  obj: X,
  prop: Y,
): obj is X & Record<Y, unknown> {
  return prop in obj;
}

export function isObjectWithOwnProperty<
  X extends ObjectType,
  Y extends PropertyKey,
>(a: unknown, prop: Y): a is X & Record<Y, unknown> {
  return isObject(a) && prop in a;
}

export function isObjectWithOwnProperties<
  X extends ObjectType,
  Y extends ReadonlyArray<PropertyKey>,
>(a: unknown, ...props: Y): a is X & Record<TupleToUnion<Y>, unknown> {
  if (!isObject(a)) {
    return false;
  }

  for (const prop of props) {
    if (!hasOwnProperty(a, prop)) {
      return false;
    }
  }

  return true;
}
