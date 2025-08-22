---
applyTo: "src/**/*.test.ts,src/tasks/**/*.test.ts,src/mediawiki/**/*.test.ts"
---

# Testing Complex Entities

## Testing Guidelines for Complex Entity Functionality

When testing entities with complex loading requirements (like NPCs with multiChildren), ensure comprehensive coverage of both success and fallback scenarios.

### Test Coverage Requirements

- **With cache provider**: Test complete functionality when cache is available
- **Without cache provider**: Test fallback behavior when cache is missing
- **Complex entities**: Special focus on NPCs with multiChildren, items with variants
- **Integration testing**: Test diff listeners to ensure complete entity data capture

### Testing Patterns

#### Complete Functionality Test

```typescript
test("should generate complete NPC page with multiChildren", async () => {
  const npc = createMockNpcWithMultiChildren();
  const result = await writeNpcPage(npc, Promise.resolve(mockCache));
  expect(result).toMatchSnapshot(); // Should include all children
});
```

#### Fallback Behavior Test

```typescript
test("should handle missing cache gracefully", async () => {
  const npc = createMockNpcWithMultiChildren();
  const result = await writeNpcPage(npc); // No cache provided
  expect(result).toMatchSnapshot(); // Should show fallback behavior
});
```

#### Diff Listener Integration Test

```typescript
test("diff listener should capture complete entity data", async () => {
  const listener = npcListener;
  await listener.handler({ oldFile: null, newFile: mockNpcFile });
  // Verify complete NPC data was written
});
```

### Snapshot Testing Best Practices

- **Use snapshots**: For generated MediaWiki content to catch missing data
- **Update carefully**: When updating snapshots, verify changes are intentional
- **Compare outputs**: Ensure complex entities show all variants, not just parent

### Validation Checklist

1. ✅ Test both with and without cache providers
2. ✅ Verify complex entities load all variants
3. ✅ Check fallback behavior is graceful
4. ✅ Use snapshots to detect incomplete output
5. ✅ Test integration between listeners and page generators
