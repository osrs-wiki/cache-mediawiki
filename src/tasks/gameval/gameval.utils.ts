import {
  NameToIdMap,
  GameValTypeChanges,
  CacheGameValMapping,
  GameValChanges,
} from "./gameval.types";

import { GameVal, GameValID, CacheProvider } from "@/utils/cache2";

/**
 * Default GameVal types to exclude (advanced types: DBTable, legacy widget, widget)
 */
export const DEFAULT_EXCLUDED_TYPES: GameValID[] = [10, 13, 14] as GameValID[];

/**
 * Filters GameVal types based on include/exclude criteria
 * @param allTypes Array of all available GameVal types
 * @param includeTypes Optional list of types to include
 * @param excludeTypes Optional list of types to exclude (defaults to advanced types)
 * @returns Filtered array of GameVal types to process
 */
export function filterGameValTypes(
  allTypes: GameValID[],
  includeTypes?: GameValID[],
  excludeTypes: GameValID[] = DEFAULT_EXCLUDED_TYPES
): GameValID[] {
  // If includeTypes is specified (even if empty), use only those types
  if (includeTypes !== undefined) {
    return allTypes.filter((type) => includeTypes.includes(type));
  }

  // Otherwise, exclude the specified types
  return allTypes.filter((type) => !excludeTypes.includes(type));
}

/**
 * Converts a Map of GameVal objects to a name→id mapping
 * @param gameValMap Map of otherID → GameVal from GameVal.all()
 * @returns Object mapping GameVal names to their otherID values
 */
export function createNameToIdMap(
  gameValMap: Map<number, GameVal> | undefined
): NameToIdMap {
  const nameToIdMap: NameToIdMap = {};

  if (!gameValMap) {
    return nameToIdMap;
  }

  for (const [otherId, gameVal] of gameValMap.entries()) {
    if (gameVal.name && gameVal.name.trim()) {
      // Use the name as key, otherID as value
      nameToIdMap[gameVal.name] = otherId;
    }
  }

  return nameToIdMap;
}

/**
 * Finds ID changes by comparing old and new name→id mappings
 * @param oldMap Name→id mapping from old cache
 * @param newMap Name→id mapping from new cache
 * @returns Object containing entities that have changed IDs
 */
export function findIdChanges(
  oldMap: NameToIdMap,
  newMap: NameToIdMap
): GameValTypeChanges {
  const changes: GameValTypeChanges = {};

  // Find entities that exist in both caches but with different IDs
  for (const [name, oldId] of Object.entries(oldMap)) {
    if (name in newMap) {
      const newId = newMap[name];
      if (oldId !== newId) {
        changes[name] = { oldId, newId };
      }
    }
  }

  return changes;
}

/**
 * Validates GameVal data to ensure it's suitable for processing
 * @param gameValMap Map of GameVal objects
 * @param gameValType The type being validated
 * @returns Object with validation results and any warnings
 */
export function validateGameValData(
  gameValMap: Map<number, GameVal> | undefined,
  gameValType: GameValID
): {
  isValid: boolean;
  warnings: string[];
  validEntries: number;
  totalEntries: number;
} {
  const warnings: string[] = [];
  let validEntries = 0;
  let totalEntries = 0;

  if (!gameValMap) {
    return {
      isValid: false,
      warnings: [`GameVal type ${gameValType} not found or empty`],
      validEntries: 0,
      totalEntries: 0,
    };
  }

  totalEntries = gameValMap.size;

  for (const [otherId, gameVal] of gameValMap.entries()) {
    if (!gameVal.name || !gameVal.name.trim()) {
      warnings.push(
        `GameVal ${gameValType}:${otherId} has empty or invalid name`
      );
    } else {
      validEntries++;
    }
  }

  const isValid = validEntries > 0;
  if (!isValid) {
    warnings.push(`No valid GameVal entries found for type ${gameValType}`);
  }

  return {
    isValid,
    warnings,
    validEntries,
    totalEntries,
  };
}

/**
 * Builds complete GameVal mapping for a single cache
 * @param cache Cache provider to scan
 * @param typesToProcess Array of GameVal types to process
 * @returns Complete mapping of GameVal names to IDs for the cache
 */
export async function buildCacheGameValMapping(
  cache: CacheProvider,
  typesToProcess: GameValID[]
): Promise<CacheGameValMapping> {
  const cacheMapping: CacheGameValMapping = {};

  console.log(`Building GameVal mapping for ${typesToProcess.length} types...`);

  for (const gameValType of typesToProcess) {
    console.log(`Processing GameVal type ${gameValType}...`);

    try {
      // Load all GameVals for this type
      const gameValMap = (await GameVal.all(cache, gameValType)) as
        | Map<number, GameVal>
        | undefined;

      // Validate the data
      const validation = validateGameValData(gameValMap, gameValType);

      if (validation.warnings.length > 0) {
        console.warn(
          `Warnings for GameVal type ${gameValType}:`,
          validation.warnings
        );
      }

      if (validation.isValid) {
        // Create name→id mapping for this type
        const nameToIdMap = createNameToIdMap(gameValMap);
        cacheMapping[gameValType] = nameToIdMap;

        console.log(
          `GameVal type ${gameValType}: ${
            Object.keys(nameToIdMap).length
          } entities mapped`
        );
      } else {
        console.warn(
          `Skipping GameVal type ${gameValType} due to validation errors`
        );
      }
    } catch (error) {
      console.error(`Error processing GameVal type ${gameValType}:`, error);
    }
  }

  return cacheMapping;
}

/**
 * Gets all available GameVal types from a cache
 * @param cache Cache provider to query
 * @returns Array of available GameVal type IDs
 */
export async function getAvailableGameValTypes(
  cache: CacheProvider
): Promise<GameValID[]> {
  try {
    const archives = await cache.getArchives(GameVal.index);
    return archives ? (archives as GameValID[]) : [];
  } catch (error) {
    console.error("Error getting available GameVal types:", error);
    return [];
  }
}

/**
 * Compares two cache GameVal mappings to find ID changes
 * @param oldMapping Complete mapping from old cache
 * @param newMapping Complete mapping from new cache
 * @returns Changes found between the two mappings
 */
export function compareGameValMappings(
  oldMapping: CacheGameValMapping,
  newMapping: CacheGameValMapping
): GameValChanges {
  const changes: GameValChanges = {};

  // Get all types that exist in either cache
  const allTypes = new Set([
    ...Object.keys(oldMapping).map(Number),
    ...Object.keys(newMapping).map(Number),
  ]);

  for (const gameValType of allTypes) {
    const oldTypeMapping = oldMapping[gameValType] || {};
    const newTypeMapping = newMapping[gameValType] || {};

    const typeChanges = findIdChanges(oldTypeMapping, newTypeMapping);

    if (Object.keys(typeChanges).length > 0) {
      changes[gameValType] = typeChanges;
    }
  }

  return changes;
}
