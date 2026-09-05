-- IntelliMeds — DDInter interaction import (core).
-- Loads all 7 DDInter CSVs into a staging table, auto-creates any missing
-- drugs, then inserts de-duplicated, name-resolved interactions.
-- Idempotent: re-running never creates duplicate drugs or interactions.
-- Run from the directory that contains the CSV files (springRestApi/data).
\set ON_ERROR_STOP on

-- Supabase caps statements at 2 min by default; the bulk insert needs longer.
SET statement_timeout = '1800s';

CREATE TEMP TABLE stg (ddid_a text, drug_a text, ddid_b text, drug_b text, level text);

\copy stg FROM 'ddinter_downloads_code_A.csv' WITH (FORMAT csv, HEADER true)
\copy stg FROM 'ddinter_downloads_code_B.csv' WITH (FORMAT csv, HEADER true)
\copy stg FROM 'ddinter_downloads_code_D.csv' WITH (FORMAT csv, HEADER true)
\copy stg FROM 'ddinter_downloads_code_H.csv' WITH (FORMAT csv, HEADER true)
\copy stg FROM 'ddinter_downloads_code_L.csv' WITH (FORMAT csv, HEADER true)
\copy stg FROM 'ddinter_downloads_code_P.csv' WITH (FORMAT csv, HEADER true)
\copy stg FROM 'ddinter_downloads_code_R.csv' WITH (FORMAT csv, HEADER true)

UPDATE stg SET drug_a = btrim(drug_a), drug_b = btrim(drug_b), level = btrim(level);

\echo '>>> staging rows loaded:'
SELECT count(*) AS staging_rows FROM stg;

-- 1) Auto-create drugs that are not already in the catalogue (matched case-insensitively
--    on generic_name). One row per distinct name; generic_name = brand_name = the name.
\echo '>>> creating missing drugs (INSERT count = new drugs):'
INSERT INTO drugs (id, generic_name, brand_name, is_active, created_at)
SELECT gen_random_uuid(), n.name, n.name, true, now()
FROM (
  SELECT min(name) AS name
  FROM (SELECT drug_a AS name FROM stg UNION ALL SELECT drug_b FROM stg) u
  WHERE name IS NOT NULL AND name <> ''
  GROUP BY lower(name)
) n
WHERE NOT EXISTS (SELECT 1 FROM drugs d WHERE lower(d.generic_name) = lower(n.name));

-- 1b) The severity CHECK constraint was created by Hibernate when the enum only had
--     MAJOR/MODERATE/MINOR. Widen it to allow UNKNOWN (matches the updated enum).
ALTER TABLE drug_interactions DROP CONSTRAINT IF EXISTS drug_interactions_severity_check;
ALTER TABLE drug_interactions ADD CONSTRAINT drug_interactions_severity_check
  CHECK (severity IN ('MAJOR','MODERATE','MINOR','UNKNOWN'));

-- 2) Insert de-duplicated interactions. Each unordered drug pair becomes one row,
--    severity mapped to the enum (anything not Major/Moderate/Minor -> UNKNOWN).
--    NOT EXISTS makes the whole step idempotent across re-runs.
-- Pre-resolve names -> ids in an indexed temp table so the big join stays fast.
CREATE TEMP TABLE n2i AS SELECT lower(generic_name) AS ln, id FROM drugs;
CREATE INDEX n2i_ln_idx ON n2i (ln);
ANALYZE n2i;

\echo '>>> inserting interactions (INSERT count = new interactions):'
INSERT INTO drug_interactions (id, drug_a_id, drug_b_id, severity, description, recommendation, created_at)
SELECT gen_random_uuid(), p.id_a, p.id_b, p.severity, NULL, NULL, now()
FROM (
  SELECT DISTINCT ON (LEAST(a.id, b.id), GREATEST(a.id, b.id))
    LEAST(a.id, b.id)    AS id_a,
    GREATEST(a.id, b.id) AS id_b,
    CASE upper(s.level)
      WHEN 'MAJOR'    THEN 'MAJOR'
      WHEN 'MODERATE' THEN 'MODERATE'
      WHEN 'MINOR'    THEN 'MINOR'
      ELSE 'UNKNOWN'
    END AS severity
  FROM stg s
  JOIN n2i a ON a.ln = lower(s.drug_a)
  JOIN n2i b ON b.ln = lower(s.drug_b)
  WHERE a.id <> b.id
) p
WHERE NOT EXISTS (
  SELECT 1 FROM drug_interactions di
  WHERE (di.drug_a_id = p.id_a AND di.drug_b_id = p.id_b)
     OR (di.drug_a_id = p.id_b AND di.drug_b_id = p.id_a)
);

DROP TABLE n2i;

\echo '>>> catalogue totals after import:'
SELECT (SELECT count(*) FROM drugs) AS drugs_total,
       (SELECT count(*) FROM drug_interactions) AS interactions_total;

DROP TABLE stg;
