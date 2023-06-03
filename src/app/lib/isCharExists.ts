export const isCharExists = (word: string, symbol: string): boolean => {
  const regex = new RegExp(symbol, "i");
  return regex.test(word);
};
