---
"@osrs-wiki/cache-mediawiki": patch
---

Add a shared `Hastranscript` template with full support for the documented link-box types and transclusion mode, and use it from the quest and NPC page builders. This fixes the quest page transcript template casing (`Hastranscript` instead of `hastranscript`) and its type value (lowercase `quest`/`miniquest` instead of `Quest`), matching the wiki's actual usage.
