/**
 * Configuration options for variant replacement task
 */
export interface VariantConfig {
  /** Directory containing files to process */
  sourceDir: string;
  /** File name pattern to match (glob syntax) */
  pattern: string;
  /** Optional regex to filter item names */
  itemFilter?: RegExp;
  /** Parameter name containing source values (e.g., 'examine', 'description') */
  sourceParam: string;
  /** Regex pattern to extract custom names (use capturing group) */
  extractionPattern: RegExp;
  /** List of parameter prefixes to update (e.g., ['version', 'image', 'altimage']) */
  targetParams: string[];
  /** Optional list of image directories to process for renames */
  imageDirectories?: string[];
  /** Preview changes without modifying files */
  dryRun: boolean;
  /** Skip suffix for first version (e.g., 'Item.png' vs 'Item (1).png') */
  skipFirstVersionSuffix?: boolean;
}

/**
 * Mapping of version numbers to custom names
 */
export interface VariantMapping {
  [versionNumber: string]: string;
}

/**
 * Parsed data from a variant file
 */
export interface FileData {
  /** Absolute path to the file */
  filePath: string;
  /** Original file content */
  content: string;
  /** Item name extracted from file */
  itemName: string;
  /** Mapping of version numbers to custom variant names */
  variantMap: VariantMapping;
  /** Total number of versions found */
  versionCount: number;
}

/**
 * File rename operation
 */
export interface RenameOperation {
  /** Original file path */
  oldPath: string;
  /** New file path */
  newPath: string;
}

/**
 * Summary statistics for variant replacement operation
 */
export interface VariantSummary {
  /** Number of files successfully processed */
  processedCount: number;
  /** Number of files skipped */
  skippedCount: number;
  /** Total number of files found */
  totalCount: number;
  /** Number of images renamed */
  imagesRenamed: number;
  /** Number of images skipped */
  imagesSkipped: number;
}
