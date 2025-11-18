/**
 * Generate a versioned image name for MediaWiki files.
 * @param baseName - The base name without version number (e.g., "Guard", "Crate of wine")
 * @param index - Zero-based index (0 = first version, 1 = second version, etc.)
 * @param suffix - Optional suffix (e.g., " chathead", " detail")
 * @returns Formatted image name (e.g., "Guard.png", "Guard (2).png", "Crate of wine detail.png")
 */
export const getVersionedImageName = (
  baseName: string,
  index: number,
  suffix: string = ""
): string => {
  const versionSuffix = index === 0 ? "" : ` (${index + 1})`;
  return `${baseName}${versionSuffix}${suffix}.png`;
};
