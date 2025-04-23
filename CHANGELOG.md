# @osrs-wiki/cache-mediawiki

## 0.20.0

### Minor Changes

- fa09be4: Add collapsible sections for diff sections

### Patch Changes

- 83165b4: Do not include Infobox Bonus images for ring and ammo slot in item pages
- 34c5d34: Replace collapsible section with mw-collapsible for diff results table generation.
- 729a249: Allow head wearpos for Infobox Bonuses in item pages
- 34c5d34: Do not include sections with empty diff tables on diff results

## 0.19.0

### Minor Changes

- bf2eb95: Add support for rev230 SpotAnim opcode 9
- fac8d43: Update GameVal to match abextm/cache2
- bf2eb95: Add support for loading GameVal
- 72472d2: Add gameval support to diffs

### Patch Changes

- e52f5f9: Add --renders arg to schedule.yml
- 7cfc539: Fix incorrect gameval id loading
- 32b12d5: Fix scenery and npc renders

## 0.18.0

### Minor Changes

- 0ee10a3: Pulls renders from https://github.com/osrs-wiki/osrs-renderer-tools & Set render argument to downloaded render artifact path
- a46bc66: Add named page creation for items, npcs, and scenery
- a46bc66: Add scenery renders

### Patch Changes

- f88b5d0: Bump tj-actions/changed-files from 41 to 46 in /.github/workflows
- e54cdcb: Add distinction between ranged ammo str and ranged equipment str bonus for items
- 0ee10a3: Update render argument to accept a path to renders if the value is not true or false.

## 0.17.0

### Minor Changes

- 33ac15e: Add varbit diffs
- a876606: Add spotanim diffs

### Patch Changes

- 33ac15e: Fix displaying of undefined-like values in diff table cells

## 0.16.0

### Minor Changes

- 1122703: Support sized flag & handle non id 0 single file archives

## 0.15.0

### Minor Changes

- c7b2d29: Add a scheduled task to run the diff tool at 6:35 AM EST on game update days (wednesday).
- 1eb9e5a: Add sub-op support to InfoboxItem generator"
- 1eb9e5a: Add subops to Item in cache2

### Patch Changes

- 19edefb: Upgrade upload-artifact to v4

## 0.14.0

### Minor Changes

- b437fc9: Add support for combat stats in item infobox

## 0.13.0

### Minor Changes

- 793b2e7: Update cache2 from latest abextm/cache2 changes

## 0.12.0

### Minor Changes

- 1d06dd1: Add support for matching renders to diffs

### Patch Changes

- 1d06dd1: Fix combat achievement monster map enum id
- 43886bd: Format render file names
- 43886bd: Add varp ScriptVarType

## 0.11.0

### Minor Changes

- 87c24a9: Add support for scenery infobox generation
- 28b9ff4: Add support for monster infobox generation
- 35b7f93: Add area definition diffs

### Patch Changes

- 7dde2af: Combat achievement improvements

## 0.10.3

### Patch Changes

- a338a41: Display cache diff table row id column as a string

## 0.10.2

### Patch Changes

- b8a6ab2: Replace examine source in clue & item pages with cache examine field
- 458c1a1: Set release and update template params from context in clue pages
- c5edca3: Use node@20.x and setup-node@v4 in github actions
- d939b35: Bump micromatch from 4.0.5 to 4.0.8
- 458c1a1: Update @osrs-wiki/mediawiki-builder to 1.6.1

## 0.10.1

### Patch Changes

- a1e1252: Add cache to setup-node

## 0.10.0

### Minor Changes

- a5c8b1a: Add support for index-level (PerArchiveLoadable) difference building

### Patch Changes

- 612b69b: Bump json5 from 1.0.1 to 1.0.2
- a7067e4: Bump braces from 3.0.2 to 3.0.3
- 71adf85: Bump @babel/traverse from 7.18.6 to 7.24.8
- 56dbf47: Bump semver from 5.7.1 to 5.7.2
- ae7d27e: Bump word-wrap from 1.2.3 to 1.2.5
- e6d0701: Bump tj-actions/changed-files from 35 to 41 in /.github/workflows

## 0.9.0

### Minor Changes

- d07011d: Add support for revision 223 changes: npc stats

### Patch Changes

- 6cb76b1: Temporarily disable sprite diffs

## 0.8.0

### Minor Changes

- 716d26a: Add support for Sprite diffs

## 0.7.0

### Minor Changes

- 4f21ff9: Add difference value highlighting to file differences.

## 0.6.0

### Minor Changes

- 95cc26d: Add support for generating Combat Achievement pages

## 0.5.1

### Patch Changes

- 7a76748: Fix a bug in detecting array differences and tests for getChangedResult

## 0.5.0

### Minor Changes

- b1007e2: Add support for versioned examines
- b1007e2: Add new options to github workflow dispatch
- 2660f32: Add examine to item diff mediawiki output

### Patch Changes

- 2660f32: Organize file difference utility functions
- 82b6476: Fix an issue with array comparison
- 2660f32: Fix item infobox update param
- 2660f32: Fix null vs non-null diff checking

## 0.4.0

### Minor Changes

- 279c1a3: Add support for generating music clue pages
- 279c1a3: Add CacheMediaWikiContext for globally tracking program args
- 279c1a3: Add writeClueFile for centralizing clue page output
- 279c1a3: Add options for building infoboxes when diff tool is ran
- 279c1a3: Add support for DiskCacheProvider to clue page generation

## 0.3.0

### Minor Changes

- 163d175: Support both local & github cache reading
- f4c4b77: Update cache2 from abex/cache2
- f4c4b77: Add partial support for local disk cache reading

### Patch Changes

- 8fe2e11: Remove distinctions between added/removed content table columns

## 0.2.0

### Minor Changes

- daf6d1f: Add support for loading different cache versions
- b2c3a4f: Support revision 220.
- daf6d1f: Add support for writing cache differences to a wiki page.
- daf6d1f: Add support for detecting cache differences in indices, archives, and files

### Patch Changes

- 572ef51: Upgrade ts-patch to fix build errors

## 0.1.0

### Minor Changes

- 8797f39: Project setup
