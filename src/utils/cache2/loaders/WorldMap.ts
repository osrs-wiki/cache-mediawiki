import { WorldMapComposite } from "./WorldMapComposite";
import { WorldMapElement } from "./WorldMapElement";
import type { CacheProvider } from "../Cache";
import { IndexType } from "../types";

let WORLD_MAP: WorldMap | null = null;

/**
 * Manager class for world map data.
 * Loads all world map composites and aggregates their elements.
 * Based on RuneLite's WorldMapManager (excluding intermapLinks).
 */
export class WorldMap {
  public static readonly index = IndexType.WorldMap;

  private readonly composites: WorldMapComposite[] = [];
  private readonly elements: WorldMapElement[] = [];

  /**
   * Gets all loaded world map composites.
   */
  public getComposites(): WorldMapComposite[] {
    return this.composites;
  }

  /**
   * Gets all world map elements from all composites.
   */
  public getElements(): WorldMapElement[] {
    return this.elements;
  }

  /**
   * Clears the cached world map instance.
   * Useful for testing or forcing a reload.
   */
  public static clearCache(): void {
    WORLD_MAP = null;
  }

  /**
   * Loads all world map data from the cache.
   * This includes all composites from the "compositemap" archive
   * and aggregates all elements into a single list.
   *
   * @param cache0 The cache provider to load from
   * @returns A WorldMap instance with all loaded data
   */
  public static async load(
    cache0: CacheProvider | Promise<CacheProvider>
  ): Promise<WorldMap> {
    if (WORLD_MAP !== null) {
      return WORLD_MAP;
    }

    const worldMap = new WorldMap();
    const composites = await WorldMapComposite.loadAll(cache0);
    if (composites.length === 0) {
      return worldMap;
    }

    worldMap.composites.push(...composites);

    // Aggregate all elements from all composites
    for (const composite of worldMap.composites) {
      worldMap.elements.push(...composite.elements);
    }

    WORLD_MAP = worldMap;

    return worldMap;
  }
}
