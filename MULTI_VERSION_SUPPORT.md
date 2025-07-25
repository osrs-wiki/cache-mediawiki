# Multi-Version NPC Support

This implementation adds support for handling multiple NPCs with the same name, preventing page overrides and generating proper MediaWiki templates with versioned parameters.

## Overview

When multiple NPCs share the same name (like "Guard"), the system now:

1. **Groups NPCs by name** - Collects all NPCs with the same name
2. **Generates versioned templates** - Creates MediaWiki templates with version parameters
3. **Uses smart parameter logic** - Shared values use single parameters, different values use numbered parameters
4. **Numbers file names** - Prevents image file overrides with numbered naming

## Features

### Multi-Version MediaWiki Templates

For NPCs with the same name, the system generates templates like:

```mediawiki
{{Infobox Monster
|version1 = 1
|version2 = 2
|version3 = 3
|name = Guard
|image1 = [[File:Guard.png|250x250px]]
|image2 = [[File:Guard (2).png|250x250px]]
|image3 = [[File:Guard (3).png|250x250px]]
|release = [[20 March]] [[2024]]
|update = Varlamore: Part One
|members = Yes
|combat = 21
|examine1 = He tries to keep order around here.
|examine2 = She tries to keep order around here.
|examine3 = She tries to keep order around here.
|id1 = 13100
|id2 = 13101
|id3 = 13102
}}
```

### Parameter Logic

- **Version parameters**: Automatically added (`version1`, `version2`, etc.)
- **Shared parameters**: Used when all NPCs have identical values (e.g., `name`, `combat`)
- **Numbered parameters**: Used when values differ (e.g., `examine1`, `examine2`, `id1`, `id2`)
- **Undefined handling**: Gracefully handles missing values

### File Naming Convention

- **First occurrence**: `Guard.png`, `Guard chathead.png`
- **Subsequent occurrences**: `Guard (2).png`, `Guard (3).png`, etc.

### Backward Compatibility

- Single NPC templates work exactly as before
- No breaking changes to existing functionality
- New multi-version support is additive

## Technical Implementation

### Core Components

1. **InfoboxTemplate** (`src/mediawiki/templates/InfoboxTemplate/`)
   - Custom template class supporting both single and multiple entities
   - Smart parameter logic for shared vs numbered parameters
   - Replaces the external `@osrs-wiki/mediawiki-builder` InfoboxTemplate

2. **NPC Name Mapping** (`src/tasks/pages/types/npc.ts`)
   - Groups NPCs by name using a global map
   - Tracks processed pages to prevent duplicates
   - Ensures all NPCs with same name are processed together

3. **Template Builders** (`src/mediawiki/templates/InfoboxMonster/`, `src/mediawiki/templates/InfoboxNpc/`)
   - Updated to handle arrays of NPCs
   - Maintains single NPC compatibility
   - Generates numbered image file references

4. **Render System** (`src/tasks/renders/npcs.ts`)
   - Tracks NPC name counts for file naming
   - Generates numbered file names for duplicates
   - Prevents image file overrides

### Key Functions

- `npcPageBuilder(npcs: NPC | NPC[])` - Builds pages for single or multiple NPCs
- `InfoboxTemplate<T>(name: string, params: T | T[])` - Creates versioned templates
- `renderNpcs(npc: NPC)` - Handles file rendering with proper naming

## Testing

Comprehensive tests cover:

- Multi-version template generation
- Shared vs numbered parameter logic
- File naming conventions
- Backward compatibility
- NPC name mapping functionality

Run tests: `npm test`

## Example Usage

```typescript
import { npcPageBuilder } from "./mediawiki/pages/npc";

// Single NPC (existing behavior)
const singleNpc = await NPC.load(cache, 1001);
const singlePage = npcPageBuilder(singleNpc);

// Multiple NPCs (new functionality)
const multipleNpcs = [
  await NPC.load(cache, 1001),
  await NPC.load(cache, 1002),
  await NPC.load(cache, 1003),
];
const multiPage = npcPageBuilder(multipleNpcs);
```

## Benefits

1. **Prevents page overrides** - Multiple NPCs with same name can coexist
2. **OSRS Wiki compatibility** - Follows established MediaWiki template patterns  
3. **Maintainable** - Clean separation of single vs multi-version logic
4. **Extensible** - Can be applied to other entity types (items, objects, etc.)
5. **Performance** - Minimal overhead for single NPC case

## Future Extensions

This infrastructure can be extended to support:
- Multi-version items with same names
- Multi-version objects/scenery
- Multi-version music tracks
- Any other entity type that may have duplicates