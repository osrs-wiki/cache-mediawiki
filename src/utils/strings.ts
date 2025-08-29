/**
 * Capitalizes the first letter of a string.
 * @param str The string to capitalize
 * @returns The string with the first letter capitalized
 */
export const capitalize = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};