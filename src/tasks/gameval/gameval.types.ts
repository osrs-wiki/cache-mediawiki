import { GameValID } from "@/utils/cache2";

/**
 * Mapping of old ID to new ID for a GameVal entity that has changed IDs
 */
export type GameValIdMapping = {
  oldId: number;
  newId: number;
};

/**
 * Map of GameVal names to their ID changes for a specific GameVal type
 * Key: GameVal name (the identifier)
 * Value: Object with oldId and newId (only included if IDs differ)
 */
export type GameValTypeChanges = {
  [name: string]: GameValIdMapping;
};

/**
 * Complete mapping of GameVal changes across all types
 * Key: GameValID (type identifier like 0 for Items, 1 for NPCs, etc.)
 * Value: Map of name changes for that type
 */
export type GameValChanges = {
  [gameValType: number]: GameValTypeChanges;
};

/**
 * Parameters for the GameVal mapping task
 */
export type GameValMappingParams = {
  /** Old cache version (e.g., "2025-07-09-rev231") */
  oldCache: string;
  /** New cache version (e.g., "2025-07-23-rev231") */
  newCache: string;
  /** Source of the cache ("github" or "local") */
  cacheSource?: "github" | "local";
  /** Type of the cache ("disk" or "flat") */
  cacheType?: "disk" | "flat";
  /** Optional list of GameVal types to include (if not specified, includes all except excluded) */
  includeTypes?: GameValID[];
  /** Optional list of GameVal types to exclude (defaults to [10, 13, 14] for advanced types) */
  excludeTypes?: GameValID[];
};

/**
 * Internal type for mapping GameVal names to their otherID values
 */
export type NameToIdMap = {
  [name: string]: number;
};

/**
 * Complete GameVal mapping for a single cache version
 * Key: GameValID (type identifier)
 * Value: Map of GameVal names to their otherID values
 */
export type CacheGameValMapping = {
  [gameValType: number]: NameToIdMap;
};

/**
 * Result of processing GameVal mappings between two cache versions
 */
export type GameValMappingResult = {
  /** Summary statistics */
  summary: {
    /** Total number of GameVal types processed */
    typesProcessed: number;
    /** Total number of entities with ID changes */
    totalChanges: number;
    /** Types that were processed successfully */
    processedTypes: GameValID[];
    /** Types that were skipped due to exclusion rules */
    skippedTypes: GameValID[];
    /** Types that had errors during processing */
    errorTypes: GameValID[];
  };
  /** Complete mapping from old cache */
  oldCacheMapping: CacheGameValMapping;
  /** Complete mapping from new cache */
  newCacheMapping: CacheGameValMapping;
  /** Only the entities that have changed IDs */
  changes: GameValChanges;
};
