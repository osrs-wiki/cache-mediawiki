# DBTables Export Task

Exports all DBTables and their DBRows from the OSRS cache to CSV files.

## Overview

This task reads all DBTable definitions from the cache, loads their associated DBRows, and generates one CSV file per table. The column headers are derived from the DBTable's GameVal `files` mapping, and each row includes the DBRow's GameVal name.

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
├── Table_Name_1.csv
├── Table_Name_2.csv
├── ...
└── Table_Name_N.csv
```

Each CSV file contains:

- `row_id` - The DBRow's unique identifier
- `row_name` - The DBRow's GameVal name (if available)
- Data columns with names from the DBTable's GameVal `files` mapping

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

1. Loads all DBTable definitions using `DBTable.all(cache)`
2. For each table:
   - Loads GameVal for table name and column headers
   - Loads all DBRows using `DBTable.loadRows(cache, tableId)`
   - Loads GameVal for each DBRow's name

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

- Tables with no rows are skipped with a warning
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
