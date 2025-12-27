/**
 * Create random unique ID in base16 format
 * 
 * Format: `<timestamp>-<random ** n>`
 */
export const uid = (() => {
  let n = 0;

  return () => `${Date.now().toString(16)}-${(n++ * 16 ** 4).toString(16).padEnd(4, '0')}`;
})();

