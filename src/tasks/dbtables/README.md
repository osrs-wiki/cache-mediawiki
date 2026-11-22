# DBTables Export Task

Exports all named DBTables and their DBRows from the OSRS cache to CSV files,
plus a typed JSON catalog.

## Overview

This task enumerates the DBTable GameVal archive and groups all DBRows by their
`table` field. This includes schema-light tables whose DBTable definition is a
one-byte sentinel and tables without a DBTableIndex master entry. The column
headers are derived from the DBTable's GameVal `files` mapping, and each row
includes the DBRow's GameVal name.

## Usage

```bash
# Export DBTables from a specific cache version
npm run start dbtables -- --newCache 2025-07-23-rev231

# Export using GitHub cache source
npm run start dbtables -- --newCache 2025-07-23-rev231 --cacheSource github

# Export using local flat cache
npm run start dbtables -- --newCache 2025-07-23-rev231 --cacheSource local --cacheType flat

# Export using local disk cache
npm run start dbtables -- --newCache 2025-07-23-rev231 --cacheSource local --cacheType disk
```

## Output Structure

The task creates the following directory structure:

```
./out/dbtables/{version}/
├── catalog.json
├── 44 - Music_Tracks.csv
├── 45 - Quest_List.csv
├── ...
└── N - Table_Name.csv
```

Each CSV file contains:

- `row_id` - The DBRow's unique identifier
- `row_name` - The DBRow's GameVal name (if available)
- Data columns with names from the DBTable's GameVal `files` mapping

`catalog.json` additionally contains:

- Every GameVal table identity, including tables without decoded schemas
- Stable semantic identification loaded from
  `cache-identification/dbtables.json`
- Column names, ScriptVar types, and DBTable default values
- Raw and effective row values with tuple boundaries preserved
- Row and table GameVal names
- Per-table and overall schema/schema-light counts

## CSV Format

- **Headers**: First row contains column names
- **Delimiter**: Comma (`,`)
- **Multi-value columns**: Values are joined with `"; "` separator
- **BigInt values**: Converted to strings for compatibility
- **Undefined/null values**: Represented as empty cells

## Example Output

For a music tracks table (`Music_Tracks.csv`):

```csv
row_id,row_name,sort_name,display_name,unlock_hint,duration
100,Arrival,Arrival,Arrival,Default unlock,120
101,Sea Shanty 2,Sea Shanty 2,Sea Shanty 2,Default unlock,180
102,Unknown,,,Manual unlock,150
```

## Implementation Details

### Data Loading

1. Loads all DBTable and DBRow GameVals
2. Loads all DBRows with `DBRow.all(cache)` and groups them by `row.table`
3. Loads semantic identification rules from `cache-identification/dbtables.json`
4. For each table:
   - Loads the optional typed DBTable definition
   - Loads GameVal names for table and column headers
   - Preserves schema-light tables and empty tables
   - Uses preloaded GameVal names for each DBRow

### Value Handling

- **Single values**: `row.values[columnIndex][0]`
- **Multiple values**: Joined with `"; "` separator
- **BigInt**: Converted to string to avoid CSV serialization issues
- **Undefined/null**: Left as undefined (empty cell in CSV)

### Filename Sanitization

Table names are sanitized for filesystem compatibility:

- Special characters replaced with underscores
- Multiple consecutive underscores collapsed
- Leading/trailing underscores removed

### Error Handling

- Tables with no rows produce header-only CSV files and remain in the catalog
- Errors processing individual tables don't stop the entire export
- Summary report shows successful exports and any errors

## CLI Options

Inherited from global CLI options:

- `--newCache <version>` - Cache version to export (required)
- `--cacheSource <source>` - Cache source: `github` or `local` (default: `local`)
- `--cacheType <type>` - Cache type for local source: `disk` or `flat` (default: `flat`)

## Performance Considerations

- Tables are processed sequentially to manage memory usage
- DBRow GameVal names are loaded in parallel for each table's rows
- Large tables with many rows may take several seconds to export

## Related Files

- Task implementation: `src/tasks/dbtables/dbtables.ts`
- Utility functions: `src/tasks/dbtables/dbtables.utils.ts`
- Type definitions: `src/tasks/dbtables/dbtables.types.ts`
- CLI command: `src/cli/commands/dbtables/dbtables.ts`
- Tests: `src/tasks/dbtables/dbtables.utils.test.ts`
