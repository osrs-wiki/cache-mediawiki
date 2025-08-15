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

pages options:
  -t, --type <type>                    The type of page to generate (item, npc, scenery) (choices: "item", "npc", "scenery", default: "item")
  -i, --id <id>                        The ID of the item, NPC, or scenery.
```

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
