-- DRY RUN: runs the full import inside a transaction and ROLLS BACK.
-- Nothing is written; the "INSERT 0 N" lines show exactly what WOULD be inserted.
\set ON_ERROR_STOP on
BEGIN;
\i ddinter_core.sql
\echo ''
\echo '=========================================================='
\echo ' DRY RUN COMPLETE — rolling back. Nothing was written.'
\echo ' The INSERT counts above are what a real run would create.'
\echo '=========================================================='
ROLLBACK;
