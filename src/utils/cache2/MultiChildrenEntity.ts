import type { CacheProvider } from "./Cache";
import { PerFileLoadable } from "./Loadable";

/**
 * Base class for entities that have multiChildren functionality.
 * This abstract class extends PerFileLoadable and provides caching, deduplication,
 * and error handling for loading child entities.
 *
 * @example Usage with NPCs:
 * ```typescript
 * export class NPC extends MultiChildrenEntity<NPC, NPCID> {
 *   public multiChildren?: NPCID[] = [];
 *
 *   constructor(id: NPCID) {
 *     super(id);
 *   }
 *
 *   protected async loadChild(cache: Promise<CacheProvider>, childId: NPCID): Promise<NPC | null> {
 *     return NPC.load(cache, childId);
 *   }
 * }
 *
 * const npc = await NPC.load(cache, 14236);
 * const children = await npc.getMultiChildren(cache);
 * ```
 */
export abstract class MultiChildrenEntity<
  TEntity,
  TID extends number
> extends PerFileLoadable {
  /** Cache for loaded multiChildren entities */
  private _cachedMultiChildren?: TEntity[];

  constructor(public id: TID) {
    super();
  }

  /**
   * Abstract method that subclasses must implement to load a child entity
   * @param cache The cache provider
   * @param childId The ID of the child entity to load
   * @returns The loaded child entity or null if not found
   */
  protected abstract loadChild(
    cache: Promise<CacheProvider>,
    childId: TID
  ): Promise<TEntity | null>;

  /**
   * Get the multiChildren entities for this entity, loading them from cache if needed.
   * Results are cached to avoid repeated loading.
   * @param cache The cache provider to load children from
   * @returns Array of unique child entities (deduplicated by ID)
   */
  public async getMultiChildren(
    cache: Promise<CacheProvider>
  ): Promise<TEntity[]> {
    // Return cached result if available
    if (this._cachedMultiChildren !== undefined) {
      return this._cachedMultiChildren;
    }

    // If no multiChildren array, return empty array and cache it
    if (!this.multiChildren || this.multiChildren.length === 0) {
      this._cachedMultiChildren = [];
      return this._cachedMultiChildren;
    }

    try {
      // Deduplicate IDs before loading to avoid loading the same entity multiple times
      const uniqueIds = new Set<TID>();
      for (const childId of this.multiChildren) {
        if (childId > 0) {
          uniqueIds.add(childId);
        }
      }

      const childEntities: TEntity[] = [];

      // Load each unique child entity only once
      for (const childId of uniqueIds) {
        try {
          const childEntity = await this.loadChild(cache, childId);
          if (childEntity) {
            childEntities.push(childEntity);
          }
        } catch (e) {
          console.warn(
            `Failed to load child entity ${childId} for parent ${this.id}:`,
            e
          );
        }
      }

      // Cache and return the result (already deduplicated by loading unique IDs)
      this._cachedMultiChildren = childEntities;
      return this._cachedMultiChildren;
    } catch (error) {
      console.warn(
        `Failed to load multiChildren for entity ${this.id}:`,
        error
      );
      this._cachedMultiChildren = [];
      return this._cachedMultiChildren;
    }
  }

  /**
   * Check if this entity has multiChildren
   */
  public hasMultiChildren(): boolean {
    return Boolean(this.multiChildren && this.multiChildren.length > 0);
  }

  /**
   * Clear the multiChildren cache for this entity.
   * Useful for testing or when entity data changes.
   */
  public clearMultiChildrenCache(): void {
    this._cachedMultiChildren = undefined;
  }

  /**
   * Get the cached multiChildren without loading from cache.
   * Returns undefined if not yet cached.
   */
  public getCachedMultiChildren(): TEntity[] | undefined {
    return this._cachedMultiChildren;
  }

  // Abstract property that subclasses must define
  public abstract multiChildren?: TID[];
}
