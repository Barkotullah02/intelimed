-- COMMIT: runs the full import for real and commits.
\set ON_ERROR_STOP on
BEGIN;
\i ddinter_core.sql
COMMIT;
\echo ''
\echo '=========================================================='
\echo ' IMPORT COMMITTED.'
\echo '=========================================================='
