# DDInter interaction import

Loads the 7 DDInter CSVs in this folder into the `drugs` and `drug_interactions`
tables. Safe to re-run (idempotent — no duplicate drugs or interactions).

## What it does
1. `\copy` all 7 CSVs into a temp staging table (handles quoted commas in drug names).
2. **Auto-creates** any drug not already in `drugs` (matched case-insensitively on
   `generic_name`; new rows get `generic_name = brand_name = <name>`).
3. Inserts **de-duplicated** interactions — one row per unordered drug pair —
   mapping the DDInter level to the `severity` enum
   (`Major/Moderate/Minor` → same; `Unknown` → `UNKNOWN`).

Expected scale (from local analysis): ~1,922 drugs, ~155,630 interactions.

## Prerequisite
The `Severity` enum must include `UNKNOWN` (already added in
`DrugInteraction.java`). Rebuild/restart the API after pulling.

## Run it
From **this directory** (`springRestApi/data`), with a working connection string.

Dry run (writes nothing, prints the counts a real run would insert):

```bash
psql "postgresql://USER:PASSWORD@HOST:5432/postgres?sslmode=require" -f ddinter_dry_run.sql
```

Commit for real:

```bash
psql "postgresql://USER:PASSWORD@HOST:5432/postgres?sslmode=require" -f ddinter_commit.sql
```

Get the current connection string from **Supabase → your project → Connect →
Session pooler**. If `gen_random_uuid()` errors, enable pgcrypto once:
`create extension if not exists pgcrypto;`
