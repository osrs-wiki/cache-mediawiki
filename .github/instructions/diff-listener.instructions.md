---
applyTo: "src/tasks/differences/listeners/**/*.ts"
---

# Diff Listener Implementation Guidelines

## Ensure Complete Entity Data in Diff Listeners

When implementing diff listeners, ensure all required parameters are passed to write functions to capture complete entity data.

### Key Principles

- **Verify all parameters**: Check that all optional parameters that may be required for complete functionality are included
- **Cache provider priority**: Pay special attention to cache providers, which enable complex entity loading
- **Test diff output**: Verify that all entity variations are captured (especially for NPCs with multiChildren)

### Standard Pattern for NPC Listeners

```typescript
if (
  Context.pages &&
  !oldEntry &&
  newEntry &&
  (newEntry.name.toLowerCase() !== "null" ||
    (newEntry.multiChildren && newEntry.multiChildren.length > 0))
) {
  // Always pass cache provider for complete NPC data
  writeNpcPage(newEntry, Promise.resolve(Context.newCacheProvider));
} else if (Context.renders && newEntry) {
  renderNpcs(newEntry);
}
```

### Validation Checklist

Before implementing or modifying diff listeners:

1. ✅ Are all required parameters passed to write functions?
2. ✅ Is the cache provider included for complex entities?
3. ✅ Are Promise wrappers used correctly for cache providers?
4. ✅ Does the output include all entity variations (test with multiChildren NPCs)?

### Common Pitfall

Missing cache parameters result in incomplete entity data - the code works but produces partial results that are difficult to detect without careful testing.
