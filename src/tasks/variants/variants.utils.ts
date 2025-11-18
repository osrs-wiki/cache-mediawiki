import { VariantConfig, VariantMapping, FileData } from "./variants.types";

/**
 * Extract custom name from text using regex pattern
 * @param text - Text to extract from
 * @param pattern - Regex pattern with capturing group
 * @returns Extracted name or null if no match
 */
export function extractCustomName(
  text: string,
  pattern: RegExp
): string | null {
  const match = text.match(pattern);
  return match && match[1] ? match[1].trim() : null;
}

/**
 * Extract item name from file content
 * @param content - File content
 * @returns Item name or empty string
 */
export function extractItemName(content: string): string {
  const nameMatch = content.match(/\|name = (.+)/);
  return nameMatch ? nameMatch[1].trim() : "";
}

/**
 * Parse a variant file to extract version mappings
 * @param content - File content
 * @param config - Variant configuration
 * @returns Mapping of version numbers to custom names
 */
export function parseVariantMapping(
  content: string,
  config: VariantConfig
): VariantMapping {
  const lines = content.split("\n");
  const mapping: VariantMapping = {};

  for (const line of lines) {
    const regex = new RegExp(`\\|${config.sourceParam}(\\d+) = (.+)`);
    const match = line.match(regex);

    if (match) {
      const versionNum = match[1];
      const sourceText = match[2].trim();
      const customName = extractCustomName(
        sourceText,
        config.extractionPattern
      );

      if (customName) {
        mapping[versionNum] = customName;
      }
    }
  }

  return mapping;
}

/**
 * Update version parameter in content
 * @param content - File content
 * @param paramPrefix - Parameter prefix (e.g., 'version')
 * @param versionNum - Version number
 * @param customName - Custom variant name
 * @returns Updated content
 */
export function updateVersionParameter(
  content: string,
  paramPrefix: string,
  versionNum: string,
  customName: string
): string {
  const oldLine = `|${paramPrefix}${versionNum} = ${versionNum}`;
  const newLine = `|${paramPrefix}${versionNum} = ${customName}`;
  return content.replaceAll(oldLine, newLine);
}

/**
 * Update image parameter in content
 * @param content - File content
 * @param itemName - Base item name
 * @param paramPrefix - Parameter prefix (e.g., 'image', 'altimage')
 * @param versionNum - Version number
 * @param customName - Custom variant name
 * @param skipFirstSuffix - Skip suffix for version 1
 * @returns Updated content
 */
export function updateImageParameter(
  content: string,
  itemName: string,
  paramPrefix: string,
  versionNum: string,
  customName: string,
  skipFirstSuffix = false
): string {
  const isFirstVersion = versionNum === "1";
  const oldSuffix = isFirstVersion && skipFirstSuffix ? "" : ` (${versionNum})`;
  const newSuffix = ` (${customName})`;

  // Handle different image parameter formats
  const imagePatterns = [
    { suffix: ".png", description: "base" },
    { suffix: " detail.png", description: "detail" },
    { suffix: " equipped.png", description: "equipped" },
    { suffix: " equipped male.png", description: "equipped male" },
    { suffix: " equipped female.png", description: "equipped female" },
  ];

  let updatedContent = content;

  for (const { suffix } of imagePatterns) {
    const oldImageName = `${itemName}${oldSuffix}${suffix}`;
    const newImageName = `${itemName}${newSuffix}${suffix}`;

    // Match the parameter line format: |paramN = [[File:...]]
    const oldParamPattern = new RegExp(
      `\\|${paramPrefix}${versionNum} = \\[\\[File:${escapeRegExp(
        oldImageName
      )}\\]\\]`,
      "g"
    );
    const newParam = `|${paramPrefix}${versionNum} = [[File:${newImageName}]]`;

    updatedContent = updatedContent.replace(oldParamPattern, newParam);
  }

  // Also handle synced switch format: |versionN = [[File:...]]
  const syncedSwitchPatterns = [
    { suffix: " detail.png|130px|left", description: "synced switch detail" },
    {
      suffix: " detail.png|120px|left",
      description: "synced switch detail alt",
    },
  ];

  for (const { suffix } of syncedSwitchPatterns) {
    const oldImageName = `${itemName}${oldSuffix}${suffix}`;
    const newImageName = `${itemName}${newSuffix}${suffix}`;

    const oldSyncPattern = new RegExp(
      `\\|${paramPrefix}${versionNum} = \\[\\[File:${escapeRegExp(
        oldImageName
      )}\\]\\]`,
      "g"
    );
    const newSync = `|${paramPrefix}${versionNum} = [[File:${newImageName}]]`;

    updatedContent = updatedContent.replace(oldSyncPattern, newSync);
  }

  return updatedContent;
}

/**
 * Escape special regex characters in a string
 * @param str - String to escape
 * @returns Escaped string
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Update all variant parameters in file content
 * @param fileData - Parsed file data
 * @param config - Variant configuration
 * @returns Updated content
 */
export function updateFileContent(
  fileData: FileData,
  config: VariantConfig
): string {
  let updatedContent = fileData.content;
  const { variantMap, itemName, versionCount } = fileData;

  // Update each version
  for (let i = 1; i <= versionCount; i++) {
    const versionNum = i.toString();
    const customName = variantMap[versionNum];

    if (!customName) {
      continue;
    }

    // Update each target parameter
    for (const paramPrefix of config.targetParams) {
      if (paramPrefix === "version") {
        updatedContent = updateVersionParameter(
          updatedContent,
          paramPrefix,
          versionNum,
          customName
        );
      } else if (paramPrefix === "image" || paramPrefix === "altimage") {
        updatedContent = updateImageParameter(
          updatedContent,
          itemName,
          paramPrefix,
          versionNum,
          customName,
          config.skipFirstVersionSuffix
        );
      }
    }
  }

  return updatedContent;
}

/**
 * Generate image file rename operations
 * @param fileData - Parsed file data
 * @param config - Variant configuration
 * @returns Array of rename operations
 */
export function generateImageRenames(
  fileData: FileData,
  config: VariantConfig
): Array<{ directory: string; oldName: string; newName: string }> {
  const renames: Array<{
    directory: string;
    oldName: string;
    newName: string;
  }> = [];
  const { variantMap, itemName, versionCount } = fileData;

  if (!config.imageDirectories) {
    return renames;
  }

  const imagePatterns = [
    { suffix: ".png", description: "miniitem" },
    { suffix: " detail.png", description: "detail" },
  ];

  for (const directory of config.imageDirectories) {
    for (let i = 1; i <= versionCount; i++) {
      const versionNum = i.toString();
      const customName = variantMap[versionNum];

      if (!customName) {
        continue;
      }

      const isFirstVersion = versionNum === "1";
      const oldSuffix =
        isFirstVersion && config.skipFirstVersionSuffix
          ? ""
          : ` (${versionNum})`;
      const newSuffix = ` (${customName})`;

      for (const { suffix } of imagePatterns) {
        renames.push({
          directory,
          oldName: `${itemName}${oldSuffix}${suffix}`,
          newName: `${itemName}${newSuffix}${suffix}`,
        });
      }
    }
  }

  return renames;
}

/**
 * Format file name by replacing invalid characters
 * @param name - File name to format
 * @returns Formatted file name
 */
export function formatFileName(name: string): string {
  return name
    .replaceAll(":", "-")
    .replaceAll("?", "")
    .replaceAll(/<[^>]*>/g, "");
}
