export type ObjectType = object;

export const isPromiseLike = <T>(a: unknown): a is PromiseLike<T> => {
  return (
    isObjectWithOwnProperty(a, "then")
    && typeof a.then === "function"
  );
};

export function isObject(a: unknown): a is ObjectType {
  return typeof a === "object" && a !== null;
}

export function isObjectWithOwnProperty<
  X extends ObjectType,
  Y extends PropertyKey,
>(a: unknown, prop: Y): a is X & Record<Y, unknown> {
  return isObject(a) && prop in a;
}
