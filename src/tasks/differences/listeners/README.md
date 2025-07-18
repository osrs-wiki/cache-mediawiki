# Cache Change Listeners

This directory contains listeners that respond to changes in specific cache files and automatically trigger actions like page regeneration.

## How It Works

When the differences engine detects changes to cache files, it checks for registered listeners that match the changed file's index, archive, and file ID. If a match is found, the listener's handler function is executed.

## Adding a New Listener

1. Create a new file in the `./types/` directory (e.g., `myListener.ts`)
2. Define your listener following this pattern:

```typescript
import { cacheListeners } from "./index";
import { CacheChangeListener } from "./types";

import Context from "@/context";
import { IndexType, ConfigType } from "@/utils/cache2";

const myListener: CacheChangeListener = {
  index: IndexType.Configs, // Required: Which index to watch
  archive: ConfigType.DbTable, // Optional: Which archive to watch
  file: 4, // Optional: Which file to watch
  handler: async ({ oldFile, newFile }) => {
    // Your handler logic here
    console.log("Cache changed, running my action...");

    // Example: Import and run a task
    const { default: myTask } = await import("../../some/task");
    await myTask(Promise.resolve(Context.newCacheProvider));
  },
};

cacheListeners.push(myListener);
```

3. Import your listener in `index.ts`:

```typescript
// Add this line to the imports section
import "./myListener";
```

## Listener Properties

- `index`: The IndexType to watch (required)
- `archive`: The archive ID to watch (optional, if omitted watches all archives in the index)
- `file`: The file ID to watch (optional, if omitted watches all files in the archive)
- `handler`: Async function that executes when a matching change is detected

## Handler Context

The handler receives an object with:

- `oldFile`: FileContext of the previous version (undefined if file was added)
- `newFile`: FileContext of the new version (undefined if file was removed)

## Examples

### Watch all DbTable changes

```typescript
{
  index: IndexType.Configs,
  archive: ConfigType.DbTable,
  // No file specified = watches all files in DbTable
}
```

### Watch specific file in DbTable

```typescript
{
  index: IndexType.Configs,
  archive: ConfigType.DbTable,
  file: 4, // Only anagram clues
}
```

### Watch all changes in Configs index

```typescript
{
  index: IndexType.Configs,
  // No archive or file specified = watches all configs
}
```

## Current Listeners

- Anagram clues: Regenerates anagram clue pages when DbTable file 4 changes
- Items: Writes item pages for new items and renders item images when any item config changes
