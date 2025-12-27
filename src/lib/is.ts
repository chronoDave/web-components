export const number = (x: string): boolean => {
  if (x.length === 0) return false;
  return !Number.isNaN(parseFloat(x));
};
