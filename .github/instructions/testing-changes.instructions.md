---
applyTo: "**"
---

# End-to-End Testing Guidelines

## Testing Changes with Real CLI Commands

When debugging errors or testing changes end-to-end, always use the actual CLI commands to validate functionality.

### Standard Test Cache Versions

Use these specific cache versions for consistent e2e testing:

- **oldCache**: `2025-07-09-rev231`
- **newCache**: `2025-07-23-rev231`

### Common E2E Testing Commands

#### Pages Command Testing
```bash
# Test single NPC page generation
npm run start pages -- --newCache 2025-07-23-rev231 --type npc --id 1234

# Test item page generation
npm run start pages -- --newCache 2025-07-23-rev231 --type item --id 5678

# Test scenery page generation  
npm run start pages -- --newCache 2025-07-23-rev231 --type scenery --id 9012
```

#### Differences Command Testing
```bash
# Test diff generation with pages output
npm run start diffs -- -o 2025-07-09-rev231 -n 2025-07-23-rev231 --pages true

# Test diff generation with renders
npm run start diffs -- -o 2025-07-09-rev231 -n 2025-07-23-rev231 --renders renders-2025-07-23-rev231-1

# Test full diff with both pages and renders
npm run start diffs -- -o 2025-07-09-rev231 -n 2025-07-23-rev231 --pages true --renders renders-2025-07-23-rev231-1
```

### Output Verification

After running CLI commands, verify results in the output directory:

- **Pages output**: `./out/pages/`
- **Differences output**: `./out/differences/`
- **Renders output**: `./out/renders-{version}/`

### Performance Expectations

- **Pages command**: Usually completes within 5-10 seconds
- **Differences command**: Can take up to 20 seconds to complete
- **Large diff operations**: May take 30+ seconds for extensive changes

### E2E Testing Best Practices

#### Before Testing
1. ✅ Clean output directory: `rm -rf ./out/*`
2. ✅ Ensure dependencies are installed: `npm install`
3. ✅ Build the project: `npm run build`

#### During Testing
1. ✅ Run actual CLI commands (not mocked functions)
2. ✅ Use consistent cache versions for reproducible results
3. ✅ Check exit codes (0 = success, non-zero = failure)
4. ✅ Verify output file existence and structure
5. ✅ Compare generated content against expected patterns

#### Validating MultiChildren NPCs
When testing NPC functionality, especially multiChildren:

```bash
# Test known NPC with multiChildren
npm run start pages -- --newCache 2025-07-23-rev231 --type npc --id 14236

# Verify output includes all child variants
ls ./out/pages/npc/named/multiChildren/
cat "./out/pages/npc/named/multiChildren/Unknown NPC 14236-14236.txt"
```

#### Snapshot Testing Integration
```typescript
// In e2e test files
test('should generate complete NPC page with multiChildren', async () => {
  const result = await runCLICommand({
    command: "npm run start",
    args: ["pages", "--", "--newCache", "2025-07-23-rev231", "--type", "npc", "--id", "14236"]
  });
  
  expect(result.exitCode).toBe(0);
  
  const outputPath = "./out/pages/npc/named/multiChildren/Unknown NPC 14236-14236.txt";
  const content = await readFile(outputPath);
  expect(content).toMatchSnapshot();
});
```

### Common Issues and Debugging

#### Command Fails with Cache Error
- Verify cache versions exist in data directory
- Check cache permissions and file integrity
- Ensure sufficient disk space for cache operations

#### Missing Output Files
- Verify command completed successfully (exit code 0)
- Check for error messages in stderr output
- Ensure output directory has write permissions

#### Incomplete Entity Data (e.g., missing multiChildren)
- Verify cache provider is being passed correctly
- Check for warning messages about missing cache access
- Test with known entities that have complex data

### Manual Verification Steps

1. **Run command with verbose output**:
   ```bash
   npm run start pages -- --newCache 2025-07-23-rev231 --type npc --id 14236 2>&1 | tee test.log
   ```

2. **Check output structure**:
   ```bash
   find ./out -type f -name "*.txt" | head -10
   ```

3. **Verify content quality**:
   ```bash
   grep -r "multiChildren\|Unknown NPC" ./out/pages/npc/ || echo "No multiChildren found"
   ```

### Automated Testing Integration

Always include e2e validation in your testing workflow:

```bash
# Full testing pipeline
npm run build
npm run test
npm run test:e2e
```
