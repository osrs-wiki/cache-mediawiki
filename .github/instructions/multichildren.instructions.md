---
applyTo: "src/tasks/differences/listeners/types/npcs.ts,src/tasks/pages/types/npc.ts,src/mediawiki/pages/npc/**/*.ts"
---

# MultiChildren Entity Handling

## Special Handling for NPCs with MultiChildren

NPCs with `multiChildren` require special attention to ensure all child variants are properly loaded and rendered.

### Core Requirements

- **Cache Access**: NPCs with `multiChildren` require cache access to load child variants
- **Complete Processing**: The `npcPageBuilder` handles loading children internally but needs cache access
- **Full Output**: Generated pages should include all child variations, not just the parent

### Detection Pattern

Always check for multiChildren when determining processing strategy:

```typescript
if (newEntry.name.toLowerCase() !== "null" || 
    (newEntry.multiChildren && newEntry.multiChildren.length > 0)) {
  // This NPC requires cache for complete functionality
  writeNpcPage(newEntry, Promise.resolve(Context.newCacheProvider));
}
```

### Page Generation Strategy

- **Named NPCs with multiChildren**: Include parent + all children
- **Null-named NPCs with multiChildren**: Include all valid children
- **Cache required**: Without cache, only parent NPC is processed (incomplete result)

### Validation

When working with multiChildren NPCs:

1. ✅ Verify cache provider is passed to write functions
2. ✅ Check that output directory structure is correct (multiChildren vs regular)
3. ✅ Confirm all child variants are included in generated pages
4. ✅ Test with both named and null-named parent NPCs

### Warning Signs

- Pages showing only single NPC when multiChildren expected
- Missing child variant information in generated output
- "Cannot load child NPCs" warnings in console logs
