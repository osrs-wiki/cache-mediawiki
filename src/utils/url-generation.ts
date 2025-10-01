import {
  URLDefinition,
  URLGeneratorContext,
  TemplateURL,
} from "@/mediawiki/pages/differences/differences.types";

/**
 * Generate URL from template or function definition
 */
export function generateURL(
  definition: URLDefinition,
  value: unknown,
  context: URLGeneratorContext
): string {
  if (typeof definition === "function") {
    return definition(value, context);
  }

  // Template substitution
  return substituteTemplate(definition, {
    [context.fieldName]: value,
    ...(context.allFields || {}),
  });
}

/**
 * Substitute template placeholders with actual values
 */
export function substituteTemplate(
  template: TemplateURL,
  values: Record<string, unknown>
): string {
  return template.replace(/\{(\w+)\}/g, (match: string, fieldName: string) => {
    const value = values[fieldName];
    return value !== undefined ? encodeURIComponent(String(value)) : match;
  });
}

/**
 * Region ID to coordinate transformation for OSRS world map
 */
export function regionToWorldMapURL(regionId: unknown): string {
  const id = Number(regionId);
  const regionX = (id >> 8) & 0xff;
  const regionY = id & 0xff;
  const worldX = regionX << 6; // Convert to world coordinates
  const worldY = regionY << 6;
  return `https://osrs.world/?cx=${worldX}&cy=26&cz=${worldY}`;
}
