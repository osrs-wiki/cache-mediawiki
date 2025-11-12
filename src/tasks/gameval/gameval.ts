import { mkdir, writeFile } from "fs/promises";

import { GameValMappingParams, GameValMappingResult, GameValChanges } from "./gameval.types";
import {
  filterGameValTypes,
  buildCacheGameValMapping,
  getAvailableGameValTypes,
  compareGameValMappings,
  DEFAULT_EXCLUDED_TYPES,
} from "./gameval.utils";

import { getCacheProviderGithub, getCacheProviderLocal } from "@/utils/cache";
import { GameValID, CacheProvider } from "@/utils/cache2";
import { LazyPromise } from "@/utils/cache2/LazyPromise";

/**
 * Generate CSV files for GameVal changes, one file per GameVal type
 * @param changes The GameVal changes data
 * @param outputDir The directory to save CSV files to
 * @param newCache The new cache version for file naming
 */
async function generateCsvFiles(changes: GameValChanges, outputDir: string, newCache: string): Promise<void> {
  const csvDir = `${outputDir}/csv`;
  await mkdir(csvDir, { recursive: true });

  for (const [gameValTypeStr, typeChanges] of Object.entries(changes)) {
    const gameValType = Number(gameValTypeStr);
    
    // Skip if no changes for this type
    if (Object.keys(typeChanges).length === 0) {
      continue;
    }

    // Create CSV header
    const csvLines = ['GameVal Name,Old ID,New ID'];
    
    // Add data rows
    for (const [name, idMapping] of Object.entries(typeChanges)) {
      const escapedName = `"${name.replace(/"/g, '""')}"`;
      csvLines.push(`${escapedName},${idMapping.oldId},${idMapping.newId}`);
    }
    
    // Write CSV file for this GameVal type
    const csvContent = csvLines.join('\n');
    const csvPath = `${csvDir}/${newCache}_gameval_type_${gameValType}_changes.csv`;
    await writeFile(csvPath, csvContent);
    
    console.log(`GameVal type ${gameValType} changes saved to: ${csvPath}`);
    console.log(`  - ${Object.keys(typeChanges).length} entities with changed IDs`);
  }
}

/**
 * Internal function to build complete GameVal mappings and detect ID changes between two cache providers
 * @param params Parameters including cache providers and filtering options
 * @returns Complete mappings and any ID changes found
 */
async function buildSingleCacheMapping({
  oldCache,
  newCache,
  includeTypes,
  excludeTypes = DEFAULT_EXCLUDED_TYPES,
}: {
  oldCache: CacheProvider;
  newCache: CacheProvider;
  includeTypes?: GameValID[];
  excludeTypes?: GameValID[];
}): Promise<GameValMappingResult> {
  console.log("Starting GameVal mapping task...");

  // Get all available GameVal types from both caches
  const [oldTypes, newTypes] = await Promise.all([
    getAvailableGameValTypes(oldCache),
    getAvailableGameValTypes(newCache),
  ]);

  // Use the union of types from both caches
  const allTypes = Array.from(new Set([...oldTypes, ...newTypes]));

  // Filter types based on include/exclude criteria
  const typesToProcess = filterGameValTypes(
    allTypes,
    includeTypes,
    excludeTypes
  );
  const skippedTypes = allTypes.filter(
    (type) => !typesToProcess.includes(type)
  );

  console.log(`Processing ${typesToProcess.length} GameVal types...`);
  console.log(`Excluded types: [${excludeTypes.join(", ")}]`);

  // Build complete mappings for both caches
  console.log("\n=== Building Old Cache Mapping ===");
  const oldCacheMapping = await buildCacheGameValMapping(
    oldCache,
    typesToProcess
  );

  console.log("\n=== Building New Cache Mapping ===");
  const newCacheMapping = await buildCacheGameValMapping(
    newCache,
    typesToProcess
  );

  console.log("\n=== Comparing Mappings ===");
  const changes = compareGameValMappings(oldCacheMapping, newCacheMapping);

  // Calculate summary statistics
  const processedTypes = typesToProcess.filter(
    (type) => oldCacheMapping[type] || newCacheMapping[type]
  );
  const errorTypes = typesToProcess.filter(
    (type) => !oldCacheMapping[type] && !newCacheMapping[type]
  );
  const totalChanges = Object.values(changes).reduce(
    (sum, typeChanges) => sum + Object.keys(typeChanges).length,
    0
  );

  const summary = {
    typesProcessed: processedTypes.length,
    totalChanges,
    processedTypes,
    skippedTypes,
    errorTypes,
  };

  console.log(`\nGameVal mapping task completed.`);
  console.log(
    `Summary: ${summary.totalChanges} total changes across ${summary.typesProcessed} types`
  );

  // Log change details
  if (totalChanges > 0) {
    console.log("\nID Changes Found:");
    for (const [gameValType, typeChanges] of Object.entries(changes)) {
      const changeCount = Object.keys(typeChanges).length;
      console.log(
        `  GameVal type ${gameValType}: ${changeCount} entities changed IDs`
      );
    }
  } else {
    console.log("No ID changes found between cache versions.");
  }

  return {
    summary,
    oldCacheMapping,
    newCacheMapping,
    changes,
  };
}

/**
 * Build complete GameVal mappings between two cache versions and save to files
 */
export const buildGameValMappings = async ({
  oldCache,
  newCache,
  cacheSource = "github",
  cacheType = "flat",
  includeTypes,
  excludeTypes,
}: GameValMappingParams): Promise<void> => {
  console.log("Building complete GameVal mappings...");

  // Set up cache providers
  const oldCacheProvider = await new LazyPromise(() =>
    cacheSource === "github"
      ? getCacheProviderGithub(oldCache)
      : getCacheProviderLocal(oldCache, cacheType)
  ).asPromise();

  const newCacheProvider = await new LazyPromise(() =>
    cacheSource === "github"
      ? getCacheProviderGithub(newCache)
      : getCacheProviderLocal(newCache, cacheType)
  ).asPromise();

  const result = await buildSingleCacheMapping({
    oldCache: oldCacheProvider,
    newCache: newCacheProvider,
    includeTypes,
    excludeTypes,
  });

  // Output the complete result
  const outputDir = "./out/gameval";
  await mkdir(outputDir, { recursive: true });

  const outputPath = `${outputDir}/${newCache}_mappings.json`;
  await writeFile(outputPath, JSON.stringify(result, null, 2));

  console.log(`Complete GameVal mappings saved to: ${outputPath}`);

  // Generate CSV files for changes
  await generateCsvFiles(result.changes, outputDir, newCache);
};

/**
 * Get only GameVal ID changes between two cache versions and save to files
 */
export const getGameValChanges = async ({
  oldCache,
  newCache,
  cacheSource = "github",
  cacheType = "flat",
  includeTypes,
  excludeTypes,
}: GameValMappingParams): Promise<void> => {
  console.log("Building GameVal ID change mappings...");

  // Set up cache providers
  const oldCacheProvider = await new LazyPromise(() =>
    cacheSource === "github"
      ? getCacheProviderGithub(oldCache)
      : getCacheProviderLocal(oldCache, cacheType)
  ).asPromise();

  const newCacheProvider = await new LazyPromise(() =>
    cacheSource === "github"
      ? getCacheProviderGithub(newCache)
      : getCacheProviderLocal(newCache, cacheType)
  ).asPromise();

  const result = await buildSingleCacheMapping({
    oldCache: oldCacheProvider,
    newCache: newCacheProvider,
    includeTypes,
    excludeTypes,
  });

  // Output only the changes
  const outputDir = "./out/gameval";
  await mkdir(outputDir, { recursive: true });

  const outputPath = `${outputDir}/${newCache}_changes.json`;
  await writeFile(outputPath, JSON.stringify(result.changes, null, 2));

  console.log(`GameVal ID changes saved to: ${outputPath}`);

  // Generate CSV files for changes
  await generateCsvFiles(result.changes, outputDir, newCache);

  // Log summary
  const totalChanges = Object.values(result.changes).reduce(
    (sum, typeChanges) => sum + Object.keys(typeChanges).length,
    0
  );
  console.log(
    `Found ${totalChanges} total ID changes across ${
      Object.keys(result.changes).length
    } GameVal types`
  );
};
