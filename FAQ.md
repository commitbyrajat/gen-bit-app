# FAQ

## How can I track and validate if `sqlglot` and Apache DataFusion are actually in use?

Validate this at two levels: static call path and runtime evidence.

### Static trace

`sqlglot` is used in the Python toolkit planner and CTE rewriter:

- `toolkit/core/wren/src/wren/engine.py`
  - imports `parse_one` from `sqlglot`
  - `_plan()` calls `parse_one(...)`
  - emits logs such as `sqlglot parse started` and `sqlglot parse completed`

- `toolkit/core/wren/src/wren/mdl/cte_rewriter.py`
  - imports `sqlglot`
  - maps Wren data sources to sqlglot dialects
  - calls `parse_one`, `qualify_tables`, `qualify_columns`, and `sqlglot.transpile`

Apache DataFusion semantic planning is reached through the Rust `wren-core` Python bindings:

- `toolkit/core/wren/src/wren/mdl/__init__.py`
  - imports `wren_core`
  - creates `wren_core.SessionContext(...)`
  - calls `session.transform_sql(sql)`

The local DataFusion execution connector is only used when the datasource is `datafusion`:

- `toolkit/core/wren/src/wren/connector/factory.py`
  - maps `DataSource.datafusion` to `wren.connector.datafusion`

- `toolkit/core/wren/src/wren/connector/datafusion.py`
  - implements `DataFusionConnector`
  - creates `wren_core.SessionContext()`
  - registers CSV or Parquet files
  - executes SQL through `self.ctx.query(sql)`

For Postgres, MySQL, and similar warehouse/database sources, the expected path is:

```text
sqlglot parses and rewrites SQL
wren_core/DataFusion expands MDL semantics
native database connector executes the final SQL
```

So for Postgres, do not expect `DataFusionConnector` in logs. You should expect `PostgresConnector` for execution, while DataFusion is still used inside `wren_core` for semantic planning.

### Runtime validation

Start the toolkit HTTP engine and run a query or dry-plan request. Then inspect logs.

Log lines that confirm the `sqlglot` path:

```text
sqlglot parse started
sqlglot parse completed
MDL manifest decoded
MDL manifest extracted
CTE rewrite started
CTE rewrite completed
```

Log lines that confirm the execution connector for Postgres:

```text
Connector initialized data_source=postgres connector=PostgresConnector
```

Log lines that confirm actual local DataFusion execution:

```text
Connector initialized data_source=datafusion connector=DataFusionConnector
DataFusion connector initialized
Registered ... tables
DataFusion query requested
DataFusion query completed
```

### Useful search commands

Search for `sqlglot` usage:

```bash
rg -n "sqlglot|parse_one|transpile|qualify_columns|qualify_tables" toolkit/core/wren/src
```

Search for DataFusion and `wren_core` usage:

```bash
rg -n "wren_core|SessionContext|transform_sql|DataFusionConnector" toolkit/core/wren/src
```

Search the connector routing:

```bash
rg -n "DataSource.datafusion|connector.datafusion" toolkit/core/wren/src
```

Check that the AI service is calling the toolkit engine:

```bash
rg -n "wren_toolkit|/v3/connector|WREN_TOOLKIT_ENDPOINT" app/wren-ai-service app/docker app/deployment
```

The expected request path is:

```text
AI service WrenToolkit
  -> POST /v3/connector/{source}/query or /dry-plan
  -> toolkit http_api.py
  -> WrenEngine.query/dry_plan
  -> sqlglot parse
  -> wren_core.SessionContext / DataFusion semantic planner
  -> connector execution
```

## How are MDL manifests created and managed? What is the MDL lifecycle?

MDL is the semantic model that Wren uses to understand the data source. It describes the project, models, physical table references, columns, primary keys, relationships, calculated fields, and views.

In this codebase there are two creation paths:

- UI-managed MDL: the Wren UI stores project/model metadata in its metadata database, then builds a manifest JSON from those rows.
- Toolkit CLI-managed MDL: the `wren context` CLI stores YAML files in a project directory, then compiles them into `target/mdl.json`.

Both paths eventually produce the same kind of manifest JSON.

### UI-managed lifecycle

The UI metadata database is the source of truth before deployment.

1. A project is created with a datasource, catalog, schema, and connection/profile data.
2. Tables are loaded from the datasource metadata API.
3. Selected tables are saved as models and model columns.
4. Primary keys and foreign-key constraints are read from metadata when supported.
5. Recommended relationships are generated from those constraints.
6. User edits update metadata rows for models, columns, calculated fields, relationships, views, and descriptions.
7. `MDLService.makeCurrentModelMDL()` reads the current metadata rows and builds an in-memory manifest.
8. `DeployService.deploy()` hashes the manifest, stores it in `deploy_log.manifest`, and sends it to the AI service.
9. Query preview, SQL validation, recommendation questions, dashboards, and AI flows use either the current in-memory manifest or the latest deployed manifest snapshot.

Important files:

- `app/wren-ui/src/apollo/server/services/mdlService.ts`
  - reads models, columns, nested columns, relations, and views from repositories
  - creates `MDLBuilder`
  - returns `{ manifest, mdlBuilder }`

- `app/wren-ui/src/apollo/server/mdl/mdlBuilder.ts`
  - adds project metadata: `catalog`, `schema`, `dataSource`
  - adds models and physical `tableReference`
  - adds columns and primary keys
  - adds relationships and relationship columns
  - adds calculated fields
  - adds views
  - post-processes the manifest for the Rust/DataFusion engine mode

- `app/wren-ui/src/apollo/server/services/deployService.ts`
  - creates a SHA-1 hash from `projectId + manifest`
  - skips deployment if the latest deployment has the same hash
  - stores the manifest in `deploy_log.manifest`
  - sends the manifest to Wren AI service
  - exposes deployed MDL by hash as base64 JSON

- `app/wren-ui/src/apollo/server/resolvers/projectResolver.ts`
  - saves selected datasource tables as models
  - calls async deploy after table or relation changes
  - generates recommended relationships from datasource constraints

- `app/wren-ui/src/apollo/server/resolvers/modelResolver.ts`
  - checks whether the current metadata and latest deployment are synchronized
  - deploys the current manifest on demand
  - fetches deployed MDL by hash

Expected UI lifecycle:

```text
datasource metadata
  -> UI metadata tables
  -> MDLService.makeCurrentModelMDL()
  -> MDLBuilder.build()
  -> in-memory manifest JSON
  -> DeployService.deploy()
  -> deploy_log.manifest
  -> AI service / query services / engine calls
```

### Toolkit CLI-managed lifecycle

The toolkit CLI uses files as the source of truth.

1. `wren context init` creates a project structure.
2. The project stores metadata in files such as:
   - `wren_project.yml`
   - `models/*/metadata.yml`
   - `views/*`
   - `relationships.yml`
   - `instructions.md`
3. `wren context build` compiles those files into `target/mdl.json`.
4. Runtime commands discover `target/mdl.json` from the project directory, or the caller can pass an explicit MDL JSON path.
5. The toolkit HTTP API accepts the manifest as base64 JSON in request payloads, under `manifestStr`.

Expected CLI lifecycle:

```text
YAML project files
  -> wren context build
  -> target/mdl.json
  -> base64 manifestStr
  -> WrenEngine
  -> sqlglot + wren_core/DataFusion planning
  -> connector execution
```

### Runtime lifecycle inside the engine

Once a manifest reaches the toolkit engine:

1. `WrenEngine` receives `manifestStr`, datasource, and connection info.
2. The manifest is decoded and summarized in logs.
3. `sqlglot` parses the user SQL and identifies referenced model names.
4. `wren_core.ManifestExtractor.extract_by(tables)` extracts the minimal manifest needed for the query.
5. `CTERewriter` expands model references into CTEs.
6. `wren_core.SessionContext` applies DataFusion-backed semantic planning.
7. The native connector executes final SQL against the datasource.

Useful engine logs:

```text
WrenEngine initialized data_source=... models=... relationships=... views=...
MDL manifest decoded data_source=... models=... relationships=... views=...
sqlglot parse completed data_source=... referencedTables=[...]
MDL manifest extracted data_source=... models=... relationships=... views=...
CTE rewrite completed data_source=... plannedSql="..."
```

If `MDL manifest extracted` shows `models=0 relationships=0`, the engine did receive a manifest but did not match the SQL table references to MDL model names. Common causes are:

- the manifest has no models because table selection/model creation did not run
- the UI has not deployed or regenerated the current manifest after metadata changes
- the SQL uses physical table names while the manifest expects model reference names
- quoted identifier casing does not match the model name
- relationships were never saved into UI metadata, even if datasource constraints exist

### How to validate the current MDL state

Check UI MDL generation and deployment logs:

```text
MDL generation started
MDL input loaded
MDLBuilder build started
MDLBuilder build finished
MDL generated
MDL deploy requested
MDL stored
MDL deploy completed
```

Search for MDL creation and deployment code:

```bash
rg -n "makeCurrentModelMDL|MDLBuilder|deploy\\(|deploy_log.manifest|createMDLHash" app/wren-ui/src/apollo/server
```

Search for where manifests are sent to the toolkit engine:

```bash
rg -n "manifestStr|Buffer.from\\(JSON.stringify\\(mdl\\)|/v3/connector" app/wren-ui/src app/wren-ai-service/src
```

Search for toolkit CLI manifest build code:

```bash
rg -n "context build|build_json|build_manifest|target/mdl.json|relationships.yml" toolkit/core/wren/src toolkit/core/wren/README.md
```
