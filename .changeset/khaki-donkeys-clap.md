---
"@osrs-wiki/cache-mediawiki": patch
---

Fix Maps index (region/scenery location) decoding so it matches RuneLite's cache loading: only locations archives are ever XTEA-decrypted (terrain never is), unencrypted archives no longer fail to load when no XTEA keys are available, and both the legacy named ("m{x}_{y}"/"l{x}_{y}") and newer unnamed archive formats are supported when resolving a region from an archive.
