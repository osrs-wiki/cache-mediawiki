/**
 * Parse a comma-separated string of index IDs into an array of numbers,
 * filtering out any invalid (NaN) values.
 *
 * @param indicesString - Comma-separated string of index IDs (e.g., "2,5,8" or "3,a,8,b")
 * @returns Array of valid numeric index IDs, or undefined if input is falsy
 *
 * @example
 * ```typescript
 * parseIndices("2,5,8") // returns [2, 5, 8]
 * parseIndices("3,a,8,b") // returns [3, 8] (filters out NaN values)
 * parseIndices("a,b,c") // returns [] (all values are invalid)
 * parseIndices(undefined) // returns undefined
 * parseIndices("") // returns undefined
 * ```
 */
export function parseIndices(indicesString?: string): number[] | undefined {
  if (!indicesString) {
    return undefined;
  }

  return indicesString
    .split(",")
    .map((id: string) => parseInt(id.trim()))
    .filter((num: number) => !isNaN(num));
}
