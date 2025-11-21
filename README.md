# cache-mediawiki

A set of scripts for fetching content from the OSRS cache and transforming it into MediaWiki format.

## Setup

### Install dependencies

```
npm install
```

### Usage

```
Usage: Cache to MediaWiki tools [options] [command]

A set of scripts for fetching content from the OSRS cache and transforming it into MediaWiki format.

Options:
  -V, --version                     output the version number
  -h, --help                        display help for command

Commands:
  combatAchievements|cas [options]  Generate combat achievement pages.
  clues [options]                   Generate clue scroll pages.
  differences|diffs [options]       Generate a page outlining differences between two cache version.
  pages|page [options]              Generate a page for an item, npc, or scenery.
  help [command]                    display help for command

Global options:
  -n, --newCache <newCache>            Path to the new cache.
  -o, --oldCache <oldCache>            Path to the old cache.
  --cacheSource <source>               Source of the cache. (choices: "github", "local", default: "github")
  --cacheType <type>                   Type of the cache. (choices: "disk", "flat", default: "flat")
  --renders <renders>                  Include renders in the output. (default: false)
  --pages <pages>                      Include pages for cache content in the output. (default: false)
  --update <update>                    The news post update title.
  --updateDate <updateDate>            The news post update date.
  --examines <examines>                Include examines in the output. (default: false)
  --examinesVersion <examinesVersion>  The version of the examines. (default: "latest")
  --beta <beta>                        Whether the cache is from a beta server. (default: false)
  --newContentTemplate <newContentTemplate>  The template for new content. (default: "New Content")
  -h, --help                           display help for command

differences options:
  --indices <indices>                  Comma-separated list of index IDs to include in differences (e.g., '2,5,8'). If not provided, all indices are checked.
  --ignoreIndices <ignoreIndices>      Comma-separated list of index IDs to exclude from differences (e.g., '2,5,8'). Takes precedence over --indices option.

pages options:
  -t, --type <type>                    The type of page to generate (item, npc, scenery) (choices: "item", "npc", "scenery", default: "item")
  -i, --id <id>                        The ID of the item, NPC, or scenery.
```

## Performance Optimization

### Local XTEA Keys

To speed up local development and testing, you can cache XTEA keys locally instead of fetching them from the OpenRS2 API each time.

XTEA keys are used to decrypt map region data when loading scenery locations. By storing them locally, you can significantly reduce load times during development.

#### File Location

Place XTEA key files in the `data/xtea/` directory with one of these naming patterns:

- `{revision}.json` (e.g., `235.json`)
- `{revision}.{N}.json` (e.g., `235.4.json`, `235.2.json`, `235.5.json`)
- `{full-cache-version}.json` (e.g., `2025-11-19-rev235.json`)

The tool will automatically find any file matching the revision number.

#### File Format

The file should contain a JSON array of XTEA key objects:

```json
[
  {
    "archive": 5,
    "group": 1234,
    "name_hash": -1153413389,
    "name": "l42_42",
    "mapsquare": 10794,
    "key": [-1303394492, 1234604739, -1845593033, -1096028287]
  }
]
```

#### Obtaining XTEA Keys

You can download XTEA keys for a specific cache version from the OpenRS2 API:

```bash
# Replace 2238 with the OpenRS2 cache ID and 235 with the revision number
# The file can be named 235.json, 235.4.json, 235.2.json, etc.
curl -o data/xtea/235.4.json https://archive.openrs2.org/caches/runescape/2238/keys.json
```

#### Fallback Behavior

If no local XTEA file is found, the tool will automatically fall back to fetching keys from the OpenRS2 API. This ensures the tool works seamlessly regardless of whether local files are available.

## Testing

### Unit Tests

Run the unit test suite:

```bash
npm test
```

### End-to-End Tests

Run end-to-end tests that validate CLI commands and output files:

```bash
npm run test:e2e
```

The e2e tests use snapshot testing to ensure generated MediaWiki content remains consistent. See [`e2e/README.md`](e2e/README.md) for detailed documentation.

To update snapshots when output changes intentionally:

```bash
npm run test:e2e -- -u
```

## Releasing

### Create a changeset

Create a changeset file by running the following command:

```
npx changeset
```

Upon merging a PR, a changeset "Release" PR will be created which consumes all changeset files to build a change log. Merging this "Release" PR will create a new Github Release.
