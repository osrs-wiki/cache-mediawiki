# Cache identification

This directory contains stable, human-reviewed annotations for cache
structures. Numeric cache IDs can be useful hints, but GameVal names and
semantic relationships are preferred identifiers.

## DBTables

`dbtables.json` maps exact or prefix-based DBTable GameVal names to a wiki
domain, use category, confidence level, and page-enrichment guidance.

The DBTables export loads these annotations into `catalog.json`. Generated
cache-version inventories, complete row dumps, and old/new comparisons should
remain under `out/` or CI artifacts rather than being committed here.

When adding a rule:

1. Prefer a stable GameVal name over a numeric table ID.
2. Use an exact rule for one table and a prefix rule for a coherent family.
3. Mark UI/client-mechanics tables as `technical`.
4. Record uncertainty in the notes rather than assigning a page type.
