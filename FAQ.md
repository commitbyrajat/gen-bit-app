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
