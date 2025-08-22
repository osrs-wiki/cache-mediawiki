---
applyTo: "src/tasks/differences/listeners/**/*.ts"
---

# Cache Provider Best Practices

## Always Pass Cache Providers for Complex Entity Operations

When working with entities that have complex loading requirements (like NPCs with `multiChildren`), always pass the cache provider parameter to enable full functionality.

### Key Rules

- **NPCs with multiChildren**: Always pass cache provider to `writeNpcPage()` calls
- **Diff listeners**: Use `Promise.resolve(Context.newCacheProvider)` or `Promise.resolve(Context.oldCacheProvider)`
- **Never omit**: Cache parameters for entities that may require complex loading

### Examples

```typescript
// ❌ Wrong - missing cache parameter, multiChildren won't load
writeNpcPage(newEntry);

// ✅ Correct - includes cache for multiChildren loading
writeNpcPage(newEntry, Promise.resolve(Context.newCacheProvider));
```

### Promise Wrapping Pattern

When passing `Context.newCacheProvider` or `Context.oldCacheProvider` to functions expecting `Promise<CacheProvider>`, wrap with `Promise.resolve()`:

```typescript
// Function signature expects Promise<CacheProvider>
writeNpcPage(npc: NPC, cache?: Promise<CacheProvider>)

// Correct usage in diff listeners
writeNpcPage(npc, Promise.resolve(Context.newCacheProvider));
```

This pattern is required because the context providers are already resolved but the function signature expects a Promise.
