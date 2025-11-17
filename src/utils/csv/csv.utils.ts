/**
 * Escapes a CSV field value by wrapping in quotes and escaping internal quotes
 */
export const escapeCsvValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  // If value contains comma, quote, or newline, wrap in quotes
  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    // Escape quotes by doubling them
    const escapedValue = stringValue.replace(/"/g, '""');
    return `"${escapedValue}"`;
  }

  return stringValue;
};

/**
 * Converts an array to a CSV-friendly string representation
 */
export const arrayToString = (arr: unknown[]): string => {
  if (!Array.isArray(arr)) {
    return String(arr);
  }

  return arr
    .map((item) =>
      typeof item === "object" && item !== null
        ? JSON.stringify(item)
        : String(item)
    )
    .join("; ");
};

/**
 * Converts an object to a CSV-friendly string representation
 */
export const objectToString = (obj: unknown): string => {
  if (obj === null || obj === undefined) {
    return "";
  }

  if (typeof obj !== "object") {
    return String(obj);
  }

  if (Array.isArray(obj)) {
    return arrayToString(obj);
  }

  try {
    return JSON.stringify(obj);
  } catch {
    return String(obj);
  }
};

/**
 * Flattens a nested object into a flat structure with dot notation
 */
export const flattenObject = (
  obj: Record<string, unknown>,
  prefix = ""
): Record<string, unknown> => {
  const flattened: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(
        flattened,
        flattenObject(value as Record<string, unknown>, newKey)
      );
    } else {
      flattened[newKey] = value;
    }
  }

  return flattened;
};

/**
 * Formats a value based on its type for CSV export
 */
export const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "boolean") {
    return value.toString();
  }

  if (typeof value === "number") {
    return value.toString();
  }

  if (Array.isArray(value)) {
    return arrayToString(value);
  }

  if (typeof value === "object") {
    return objectToString(value);
  }

  return String(value);
};
