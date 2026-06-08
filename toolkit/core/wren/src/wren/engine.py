"""WrenEngine — SQL transform + execute against a data source.

Example usage:

    from wren.engine import WrenEngine
    from wren.model.data_source import DataSource

    engine = WrenEngine(
        manifest_str="<base64-encoded MDL JSON>",
        data_source=DataSource.postgres,
        connection_info={"host": "localhost", "port": 5432, ...},
    )

    # Plan only (no DB required)
    planned_sql = engine.dry_plan("SELECT * FROM orders")

    # Execute against the data source
    arrow_table = engine.query("SELECT * FROM orders", limit=100)
"""

from __future__ import annotations

import base64
import hashlib
import json
from typing import Any

import pyarrow as pa
from loguru import logger
from sqlglot import exp

from wren.config import WrenConfig
from wren.connector.factory import get_connector
from wren.mdl import get_manifest_extractor, get_session_context, to_json_base64
from wren.mdl.cte_rewriter import (
    CTERewriter,
    get_sqlglot_dialect,
    parse_one_with_identifier_quote_repair,
)
from wren.model.data_source import DataSource
from wren.model.error import DIALECT_SQL, ErrorCode, ErrorPhase, WrenError
from wren.policy import resolve_model_name, validate_sql_policy


def _preview_sql(sql: str, max_len: int = 240) -> str:
    return " ".join(sql.split())[:max_len]


def _manifest_summary(manifest_str: str) -> dict[str, Any]:
    digest = hashlib.sha256(manifest_str.encode()).hexdigest()[:12]
    try:
        manifest_json = json.loads(base64.b64decode(manifest_str))
    except Exception:
        return {
            "hash": digest,
            "models": "unknown",
            "relationships": "unknown",
            "views": "unknown",
        }
    return {
        "hash": digest,
        "models": len(manifest_json.get("models", [])),
        "relationships": len(manifest_json.get("relationships", [])),
        "views": len(manifest_json.get("views", [])),
    }


def _table_shape(table: Any) -> tuple[Any, Any]:
    rows = getattr(table, "num_rows", None)
    columns = getattr(table, "num_columns", None)
    if rows is not None and columns is not None:
        return rows, columns
    try:
        df = table.to_pandas()
        return len(df), len(df.columns)
    except Exception:
        return "unknown", "unknown"


class WrenEngine:
    """Thin facade over wren-core MDL processing and connector execution.

    Parameters
    ----------
    manifest_str:
        Base64-encoded MDL JSON string (as produced by ``wren_core.to_json_base64``).
    data_source:
        Target data source enum value.
    connection_info:
        Dict of connection parameters OR a typed ConnectionInfo object.
    function_path:
        Optional path to a CSV file of custom function definitions.
        Passed through to wren-core SessionContext.
    """

    def __init__(
        self,
        manifest_str: str,
        data_source: DataSource | str,
        connection_info: dict[str, Any] | object,
        function_path: str | None = None,
        *,
        fallback: bool = True,
        config: WrenConfig | None = None,
    ):
        if isinstance(data_source, str):
            data_source = DataSource(data_source)

        self.manifest_str = manifest_str
        self.data_source = data_source
        self.function_path = function_path
        self._fallback = fallback
        self._config = config or WrenConfig()

        # Build typed ConnectionInfo if a raw dict was given.
        # An empty dict is allowed for transpile-only usage (no DB connection).
        if isinstance(connection_info, dict) and connection_info:
            self.connection_info = data_source.get_connection_info(connection_info)
        else:
            self.connection_info = connection_info

        self._connector = None
        summary = _manifest_summary(manifest_str)
        logger.info(
            "WrenEngine initialized "
            f"data_source={self.data_source.value} manifestHash={summary['hash']} "
            f"models={summary['models']} relationships={summary['relationships']} "
            f"views={summary['views']} connectionInfoType={type(self.connection_info).__name__}"
        )

    # ------------------------------------------------------------------
    # SQL transformation (no DB access)
    # ------------------------------------------------------------------

    def dry_plan(self, sql: str, properties: dict | None = None) -> str:
        """Plan SQL through MDL and return the expanded SQL in the target dialect.

        Transformation flow::

            User SQL (target dialect, e.g. Postgres)
              → sqlglot parse (target dialect)
              → qualify_tables + normalize_identifiers + qualify_columns
              → identify referenced models and columns
              → per-model: wren-core transform_sql → Wren dialect SQL
              → per-model: sqlglot parse (Wren dialect) → inject as CTE
              → sqlglot generate (target dialect)
              → output SQL with model CTEs in target dialect
        """
        return self._plan(sql, properties)

    # ------------------------------------------------------------------
    # SQL execution
    # ------------------------------------------------------------------

    def query(
        self,
        sql: str,
        limit: int | None = None,
        properties: dict | None = None,
    ) -> pa.Table:
        """Transpile and execute SQL, return results as an Arrow table."""
        logger.info(
            "WrenEngine query requested "
            f'data_source={self.data_source.value} limit={limit} sql="{_preview_sql(sql)}"'
        )
        dialect_sql = self.dry_plan(sql, properties)
        connector = self._get_connector()
        try:
            table = connector.query(dialect_sql, limit)
            rows, columns = _table_shape(table)
            logger.info(
                "WrenEngine query completed "
                f"data_source={self.data_source.value} rows={rows} columns={columns}"
            )
            return table
        except WrenError:
            raise
        except Exception as e:
            raise WrenError(
                ErrorCode.GENERIC_USER_ERROR,
                str(e),
                phase=ErrorPhase.SQL_EXECUTION,
                metadata={DIALECT_SQL: dialect_sql},
            ) from e

    def dry_run(self, sql: str, properties: dict | None = None) -> None:
        """Transpile and dry-run SQL without returning results."""
        logger.info(
            "WrenEngine dry_run requested "
            f'data_source={self.data_source.value} sql="{_preview_sql(sql)}"'
        )
        dialect_sql = self.dry_plan(sql, properties)
        connector = self._get_connector()
        try:
            connector.dry_run(dialect_sql)
            logger.info(
                f"WrenEngine dry_run completed data_source={self.data_source.value}"
            )
        except WrenError:
            raise
        except Exception as e:
            raise WrenError(
                ErrorCode.GENERIC_USER_ERROR,
                str(e),
                phase=ErrorPhase.SQL_DRY_RUN,
                metadata={DIALECT_SQL: dialect_sql},
            ) from e

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------

    def close(self) -> None:
        if self._connector is not None:
            self._connector.close()
            self._connector = None

    def __enter__(self):
        return self

    def __exit__(self, *_):
        self.close()

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _plan(self, sql: str, properties: dict | None) -> str:
        processed = None
        if properties:
            processed = frozenset(properties.items())

        try:
            # Extract minimal manifest scoped to tables referenced in the SQL.
            # Use sqlglot (not DataFusion parser) since input is target dialect.
            dialect = get_sqlglot_dialect(self.data_source)
            logger.info(
                "sqlglot parse started "
                f'data_source={self.data_source.value} dialect={dialect} sql="{_preview_sql(sql)}"'
            )
            ast, repaired_sql = parse_one_with_identifier_quote_repair(
                sql, dialect=dialect
            )
            if repaired_sql != sql:
                logger.warning(
                    "SQL identifier quote repair applied "
                    f'data_source={self.data_source.value} sql="{_preview_sql(repaired_sql)}"'
                )
                sql = repaired_sql

            manifest_json = json.loads(base64.b64decode(self.manifest_str))
            model_names = {m["name"] for m in manifest_json.get("models", [])}
            logger.info(
                "MDL manifest decoded "
                f"data_source={self.data_source.value} models={len(model_names)} "
                f"relationships={len(manifest_json.get('relationships', []))} "
                f"views={len(manifest_json.get('views', []))}"
            )

            # Policy validation: check tables and functions before execution.
            if self._config.strict_mode or self._config.denied_functions:
                validate_sql_policy(ast, model_names, self._config)

            # Resolve table refs to canonical manifest model names so that
            # ``extract_by`` (case-sensitive in Rust) finds them under SQL's
            # case-sensitivity rules: quoted identifiers match exactly,
            # unquoted fall back to a case-insensitive scan.
            tables: list[str] = []
            for t in ast.find_all(exp.Table):
                if not t.name:
                    continue
                quoted = (
                    bool(t.this.quoted) if isinstance(t.this, exp.Identifier) else False
                )
                resolved = resolve_model_name(t.name, quoted, model_names)
                tables.append(resolved if resolved is not None else t.name)
            logger.info(
                "sqlglot parse completed "
                f"data_source={self.data_source.value} referencedTables={tables}"
            )

            extractor = get_manifest_extractor(self.manifest_str)
            manifest = extractor.extract_by(tables)
            effective_manifest = to_json_base64(manifest)
            extracted_models = (
                manifest.get("models", []) if isinstance(manifest, dict) else []
            )
            extracted_relationships = (
                manifest.get("relationships", []) if isinstance(manifest, dict) else []
            )
            extracted_views = (
                manifest.get("views", []) if isinstance(manifest, dict) else []
            )
            logger.info(
                "MDL manifest extracted "
                f"data_source={self.data_source.value} models={len(extracted_models)} "
                f"relationships={len(extracted_relationships)} views={len(extracted_views)}"
            )
        except WrenError:
            raise
        except Exception as e:
            if self._config.strict_mode or self._config.denied_functions:
                raise WrenError(
                    ErrorCode.INVALID_SQL,
                    str(e),
                    phase=ErrorPhase.SQL_PLANNING,
                    metadata={DIALECT_SQL: sql},
                ) from e
            effective_manifest = self.manifest_str
            logger.warning(
                "MDL manifest extraction fallback "
                f"data_source={self.data_source.value} reason={e}"
            )

        try:
            logger.info(
                "CTE rewrite started "
                f"data_source={self.data_source.value} fallback={self._fallback}"
            )
            session = get_session_context(
                effective_manifest,
                self.function_path,
                processed,
                self.data_source.name,
            )
            rewriter = CTERewriter(
                effective_manifest,
                session,
                self.data_source,
                fallback=self._fallback,
            )
            planned_sql = rewriter.rewrite(sql)
            logger.info(
                "CTE rewrite completed "
                f'data_source={self.data_source.value} plannedSql="{_preview_sql(planned_sql)}"'
            )
            return planned_sql
        except Exception as e:
            raise WrenError(
                ErrorCode.INVALID_SQL,
                str(e),
                phase=ErrorPhase.SQL_PLANNING,
                metadata={DIALECT_SQL: sql},
            ) from e

    def _get_connector(self):
        if self._connector is None:
            logger.info(
                f"Connector initialization requested data_source={self.data_source.value}"
            )
            self._connector = get_connector(self.data_source, self.connection_info)
            logger.info(
                "Connector initialized "
                f"data_source={self.data_source.value} connector={type(self._connector).__name__}"
            )
        return self._connector
