import { readdir, readFile, writeFile, rename, access } from "fs/promises";
import path from "path";

import { VariantConfig, FileData, VariantSummary } from "./variants.types";
import {
  extractItemName,
  parseVariantMapping,
  updateFileContent,
  generateImageRenames,
} from "./variants.utils";

/**
 * Discover files matching the pattern in the source directory
 * @param config - Variant configuration
 * @returns Array of file paths
 */
async function discoverFiles(config: VariantConfig): Promise<string[]> {
  const { sourceDir, pattern, itemFilter } = config;

  try {
    const files = await readdir(sourceDir);
    const matchingFiles = files.filter((file) => {
      // Basic pattern matching (supports *.txt style)
      const patternRegex = new RegExp(
        "^" + pattern.replace(/\*/g, ".*").replace(/\?/g, ".") + "$"
      );
      if (!patternRegex.test(file)) {
        return false;
      }

      // Apply item filter if provided
      if (itemFilter) {
        const itemName = file.replace(/\-\d+\.txt$/, ""); // Remove ID suffix
        return itemFilter.test(itemName);
      }

      return true;
    });

    return matchingFiles.map((file) => path.join(sourceDir, file));
  } catch (error) {
    console.error(`Error reading directory ${sourceDir}:`, error);
    return [];
  }
}

/**
 * Parse a single file to extract variant data
 * @param filePath - Path to file
 * @param config - Variant configuration
 * @returns Parsed file data or null if parsing failed
 */
async function parseFile(
  filePath: string,
  config: VariantConfig
): Promise<FileData | null> {
  try {
    const content = await readFile(filePath, "utf-8");
    const itemName = extractItemName(content);

    if (!itemName) {
      return null;
    }

    const variantMap = parseVariantMapping(content, config);

    if (Object.keys(variantMap).length === 0) {
      return null;
    }

    const versionCount = Math.max(
      ...Object.keys(variantMap).map((v) => parseInt(v))
    );

    return {
      filePath,
      content,
      itemName,
      variantMap,
      versionCount,
    };
  } catch (error) {
    console.error(`Error parsing file ${filePath}:`, error);
    return null;
  }
}

/**
 * Parse all discovered files
 * @param filePaths - Array of file paths
 * @param config - Variant configuration
 * @returns Array of parsed file data
 */
async function parseFiles(
  filePaths: string[],
  config: VariantConfig
): Promise<FileData[]> {
  const fileDataList: FileData[] = [];

  for (const filePath of filePaths) {
    const fileData = await parseFile(filePath, config);
    if (fileData) {
      fileDataList.push(fileData);
    }
  }

  return fileDataList;
}

/**
 * Process image renames for all files
 * @param fileDataList - Array of parsed file data
 * @param config - Variant configuration
 * @returns Statistics about renamed/skipped images
 */
async function processImageRenames(
  fileDataList: FileData[],
  config: VariantConfig
): Promise<{ renamed: number; skipped: number }> {
  let renamed = 0;
  let skipped = 0;

  for (const fileData of fileDataList) {
    const renames = generateImageRenames(fileData, config);

    for (const { directory, oldName, newName } of renames) {
      const oldPath = path.join(directory, oldName);
      const newPath = path.join(directory, newName);

      try {
        await access(oldPath);

        if (config.dryRun) {
          console.log(`[DRY RUN] Would rename: ${oldPath} -> ${newPath}`);
          renamed++;
        } else {
          await rename(oldPath, newPath);
          console.log(`Renamed: ${oldPath} -> ${newPath}`);
          renamed++;
        }
      } catch {
        console.warn(`File not found (skipping): ${oldPath}`);
        skipped++;
      }
    }
  }

  return { renamed, skipped };
}

/**
 * Print summary report
 * @param summary - Summary statistics
 * @param config - Variant configuration
 */
function reportSummary(summary: VariantSummary, config: VariantConfig): void {
  console.log("\n" + "=".repeat(60));
  console.log("Summary:");
  console.log(`  Processed: ${summary.processedCount}`);
  console.log(`  Skipped: ${summary.skippedCount}`);
  console.log(`  Total: ${summary.totalCount}`);

  if (config.imageDirectories) {
    console.log(`  Images Renamed: ${summary.imagesRenamed}`);
    console.log(`  Images Skipped: ${summary.imagesSkipped}`);
  }

  if (config.dryRun) {
    console.log(
      "\n[DRY RUN] No changes were made. Run without --dry-run to apply."
    );
  }
}

/**
 * Replace numbered variants with custom names in multiChildren files
 * @param config - Variant configuration
 */
export default async function replaceVariants(
  config: VariantConfig
): Promise<void> {
  if (config.dryRun) {
    console.log("Running in DRY RUN mode - no changes will be made\n");
  }

  // 1. Discover files
  const filePaths = await discoverFiles(config);
  console.log(`Found ${filePaths.length} files to process\n`);

  if (filePaths.length === 0) {
    console.log("No files found. Exiting.");
    return;
  }

  // 2. Parse files and extract mappings
  const fileDataList = await parseFiles(filePaths, config);
  const skippedCount = filePaths.length - fileDataList.length;

  if (fileDataList.length === 0) {
    console.log("No valid files to process. Exiting.");
    return;
  }

  // 3. Update file contents
  let processedCount = 0;

  for (const fileData of fileDataList) {
    const fileName = path.basename(fileData.filePath);
    console.log(`\nProcessing: ${fileName}`);
    console.log(`  Item: ${fileData.itemName}`);
    console.log(`  Variants:`);

    for (const [version, name] of Object.entries(fileData.variantMap)) {
      console.log(`    Version ${version}: ${name}`);
    }

    const updatedContent = updateFileContent(fileData, config);

    if (config.dryRun) {
      console.log(`  [DRY RUN] Would update page file`);
    } else {
      await writeFile(fileData.filePath, updatedContent, "utf-8");
      console.log(`  ✓ Updated page file`);
    }

    processedCount++;
  }

  // 4. Rename images if directories provided
  let imagesRenamed = 0;
  let imagesSkipped = 0;

  if (config.imageDirectories && config.imageDirectories.length > 0) {
    const imageStats = await processImageRenames(fileDataList, config);
    imagesRenamed = imageStats.renamed;
    imagesSkipped = imageStats.skipped;
  }

  // 5. Report summary
  const summary: VariantSummary = {
    processedCount,
    skippedCount,
    totalCount: filePaths.length,
    imagesRenamed,
    imagesSkipped,
  };

  reportSummary(summary, config);
  console.log("\nDone!");
}
