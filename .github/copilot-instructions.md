# GitHub Copilot Instructions

## Project Overview

This is a TypeScript Node.js CLI application that processes OSRS (Old School RuneScape) cache data and transforms it into MediaWiki format. The application uses Commander.js for CLI setup and is designed as a single-run tool with multiple commands.

## Code Style & Architecture

### General Guidelines

- Use TypeScript with strict typing
- Follow ESLint and Prettier configurations
- Use absolute imports with `@/` prefix for src directory
- Prefer `async/await` over Promises for asynchronous operations
- Use underscore.js library utilities where appropriate

### File Organization

- CLI commands are organized in `src/cli/commands/` subdirectories
- Each command should have its own directory with an `index.ts` file
- Utility functions are grouped by purpose in `src/utils/`
- Type definitions for the OSRS Cache are in `src/types/`
- Types in general are stored alongside the code that uses them in a `*.types.ts` file
- MediaWiki-related code is in `src/mediawiki/`
- Tasks for commands are defined in `src/tasks/`

### CLI Command Structure

When creating new CLI commands:

```typescript
import { Command } from "commander";

const command = new Command()
  .name("command-name")
  .description("Command description")
  .action(async (options) => {
    // Command implementation
  });

export default command;
```

- Commands should be exported as default from their respective files
- Use descriptive names and help text
- Always handle errors gracefully
- Log progress for long-running operations

### Context Usage

- Use the global `Context` object from `@/context` for shared application state
- Access Context properties directly, don't modify them in commands

### Data Processing Patterns

- Cache data is stored in `data/flatcache/` and `data/renders/`
- Use the cache utilities in `@/utils/cache` for reading cache files
- MediaWiki output should use the `@osrs-wiki/mediawiki-builder` library

### Error Handling

- Use try-catch blocks for async operations
- Provide meaningful error messages to users
- Log errors with context about what operation failed
- Don't crash the application for non-critical errors

### Dependencies

Key dependencies to be aware of:

- `commander` - CLI framework
- `@osrs-wiki/mediawiki-builder` - MediaWiki content generation
- `diff` - Text diffing
- `underscore` - Utility functions
- `dotenv` - Environment configuration

### Testing

- Tests use Jest framework
- Test files should be co-located with source files
- Mock external dependencies and file system operations
- Test both success and error scenarios
- Use import and `jest.spyOn` for mocking functions.
- Do not use `require` for mocking, as it is not compatible with TypeScript's module system.
- When testing `MediaWikiBuilder` use snapshot testing for `build()` output.

### Code Examples

#### Reading cache data:

```typescript
import { readFlatCache } from "@/utils/cache";

const cacheData = await readFlatCache(version, cacheIndex);
```

#### Creating MediaWiki pages:

```typescript
import { MediaWikiBuilder } from "@osrs-wiki/mediawiki-builder";

const builder = new MediaWikiBuilder();
builder.addContents([new MediaWikiText("test content")]);
const wikitext = builder.build();
```

#### Command with options:

```typescript
const command = new Command()
  .name("example")
  .description("Example command")
  .option("-i, --input <file>", "Input file path")
  .option("--verbose", "Enable verbose output")
  .action(async (options) => {
    if (options.verbose) {
      console.log("Processing with verbose output");
    }
    // Implementation
  });
```

## MediaWiki-Specific Guidelines

- Generate proper wikitext format
- Use appropriate MediaWiki templates
- Handle special characters and escaping
- Follow OSRS Wiki naming conventions
- Include proper categories and redirects

## Performance Considerations

- Process large datasets in chunks
- Use streaming for large file operations
- Cache expensive computations
- Avoid loading entire cache into memory at once

## Git Workflow

- Work on feature branches
- Use conventional commit messages
- Update changelog for user-facing changes
- Test locally before pushing
- **Always include a changeset in pull requests** - This is required for all PRs
  - Keep changesets focused on a single feature or fix with a single sentence summary
  - Use `patch` for bug fixes, `minor` for new features, `major` for breaking changes
  - Create changeset files in `.changeset/` directory with format:
    ```
    ---
    "@osrs-wiki/cache-mediawiki": patch
    ---
    
    Brief description of the change
    ```

Remember: This is a specialized tool for OSRS Wiki editors, so prioritize accuracy of game data and MediaWiki compatibility over general-purpose features.
