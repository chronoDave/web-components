export const maybe = <T, K>(fn: (x: T) => K) =>
  (x?: T | null): K | null => {
    if (x === null || x === undefined) return null;
    return fn(x);
  };

export const always = (error: Error) =>
  <T>(x: T): NonNullable<T> => {
    if (x === null || x === undefined) throw error;
    return x;
  };

export const compose = <X, T>(f: (x: X) => T) =>
  <Y>(g: (y: Y) => X) =>
    (y: Y) =>
      f(g(y));
