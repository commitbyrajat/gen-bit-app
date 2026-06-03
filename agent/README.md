## Install Wren Toolkit
```
uv pip install ../toolkit/core/wren/dist/wrenai-0.8.1-py3-none-any.whl
```

## Add DB profile
```
uv run wren profile add employee_pg --from-file db/profiles/employee_pg.yml --activate
```

## Show Profiles
```
uv run wren profile list 
```

## Import DB metadata
Generate a Wren MDL project from the active profile's target database:

```
uv run python scripts/import_db_metadata.py --output db/metadata --force
```

Then query/build against that generated project:

```
uv run wren context show --path db/metadata
uv run wren context build --path db/metadata
```
## Generate MDL
```
Implemented the metadata import utility and generated the MDL project.

  Added scripts/import_db_metadata.py. It uses the active Wren profile from ~/.wren/profiles.yml, introspects Postgres tables, columns, primary keys, foreign keys, comments, and views, then writes a Wren project.

  Usage:

  uv run python scripts/import_db_metadata.py --output db/metadata --force

  Optional schema filter:

  uv run python scripts/import_db_metadata.py --output db/metadata --schema public --force
```

## Build Context
```
uv run wren context init --from-mdl db/metadata/target/mdl.json --force
uv run wren context build -p db/metadata 
uv run wren context build
```

## Vectorize memory
```
need 
    uv add 'wrenai[memory]'

uv run wren memory index --mdl db/metadata/target/mdl.json 
```

## Execute sql
```
 uv run wren --sql '       
SELECT
  e.employee_name,
  SUM(ep.allocation_percent) AS total_allocation
FROM "employees" e
JOIN "employee_projects" ep
  ON e.employee_id = ep.employee_id
GROUP BY e.employee_name
HAVING SUM(ep.allocation_percent) > 80
ORDER BY total_allocation DESC
'
2026-06-03 08:50:51.170 | DEBUG    | wren.connector.postgres:_get_pg_decimal_type:93 - Postgres NUMERIC column has no scale metadata; defaulting to decimal128(38, 9)
employee_name total_allocation
  Rajat Mehta    100.000000000
  Rohan Gupta     90.000000000
  Vikram Nair     90.000000000

# To save this query:
# wren memory store --nl '<natural language question>' --sql '
SELECT
  e.employee_name,
  SUM(ep.allocation_percent) AS total_allocation
FROM "employees" e
JOIN "employee_projects" ep
  ON e.employee_id = ep.employee_id
GROUP BY e.employee_name
HAVING SUM(ep.allocation_percent) > 80
ORDER BY total_allocation DESC

```