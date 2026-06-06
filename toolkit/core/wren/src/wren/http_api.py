"""HTTP connector API backed by the DataFusion-powered Wren toolkit engine."""

from __future__ import annotations

import datetime as dt
import decimal
import hashlib
from typing import Any
from urllib.parse import parse_qsl, unquote, urlparse

import psycopg
import uvicorn
from fastapi import FastAPI, Query, Response
from fastapi.responses import ORJSONResponse
from loguru import logger
from pydantic import BaseModel, Field

from wren import __version__
from wren.config import WrenConfig
from wren.engine import WrenEngine
from wren.model.data_source import DataSource
from wren.model.error import DIALECT_SQL, ErrorCode, WrenError
from wren.profile import expand_profile_secrets
from wren.profile_store import PostgresProfileStore


class QueryDTO(BaseModel):
    sql: str
    manifest_str: str = Field(alias="manifestStr")
    strict_mode: bool = Field(default=False, alias="strictMode")
    connection_info: dict[str, Any] = Field(
        default_factory=dict, alias="connectionInfo"
    )
    profile_id: str | None = Field(default=None, alias="profileId")


class DryPlanDTO(BaseModel):
    sql: str
    manifest_str: str = Field(alias="manifestStr")


class MetadataDTO(BaseModel):
    connection_info: dict[str, Any] = Field(
        default_factory=dict, alias="connectionInfo"
    )
    profile_id: str | None = Field(default=None, alias="profileId")


class ValidateDTO(BaseModel):
    manifest_str: str = Field(alias="manifestStr")
    connection_info: dict[str, Any] = Field(
        default_factory=dict, alias="connectionInfo"
    )
    profile_id: str | None = Field(default=None, alias="profileId")
    parameters: dict[str, Any] = Field(default_factory=dict)


class TranspileDTO(QueryDTO):
    pass


class ProfileDTO(BaseModel):
    profile_id: str = Field(alias="profileId")
    data_source: str = Field(alias="dataSource")
    connection_info: dict[str, Any] = Field(alias="connectionInfo")
    activate: bool = False


DATA_SOURCE_ALIASES = {
    "ATHENA": "athena",
    "BIG_QUERY": "bigquery",
    "BIGQUERY": "bigquery",
    "CLICK_HOUSE": "clickhouse",
    "CLICKHOUSE": "clickhouse",
    "DATAFUSION": "datafusion",
    "DATA_FUSION": "datafusion",
    "DATABRICKS": "databricks",
    "DUCKDB": "duckdb",
    "MSSQL": "mssql",
    "MYSQL": "mysql",
    "ORACLE": "oracle",
    "POSTGRES": "postgres",
    "REDSHIFT": "redshift",
    "SNOWFLAKE": "snowflake",
    "TRINO": "trino",
    "LOCAL_FILE": "local_file",
    "S3_FILE": "s3_file",
    "MINIO_FILE": "minio_file",
    "GCS_FILE": "gcs_file",
}

_profile_store: PostgresProfileStore | None = None


def _preview_sql(sql: str, max_len: int = 240) -> str:
    return " ".join(sql.split())[:max_len]


def _manifest_summary(manifest_str: str) -> str:
    digest = hashlib.sha256(manifest_str.encode()).hexdigest()[:12]
    return f"manifestHash={digest} manifestBytes={len(manifest_str)}"


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


def create_app() -> FastAPI:
    app = FastAPI(title="Wren Toolkit Compatibility API")

    @app.get("/")
    def root() -> dict[str, str]:
        return {"service": "wren-toolkit-http", "version": __version__}

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    @app.get("/config")
    def config() -> dict[str, Any]:
        return {"version": __version__, "engine": "wren-toolkit"}

    _register_profile_routes(app)

    for prefix in ("/v2", "/v3"):
        _register_connector_routes(app, prefix)

    return app


def _register_profile_routes(app: FastAPI) -> None:
    @app.post("/v1/profiles")
    def upsert_profile(dto: ProfileDTO):
        try:
            ds = _parse_data_source(dto.data_source)
            profile = _profile_payload(ds, dto.connection_info)
            store = _get_profile_store()
            store.upsert_profile(dto.profile_id, profile, activate=dto.activate)
            logger.info(
                "Toolkit profile stored "
                f"profileId={dto.profile_id} dataSource={ds.value} "
                "storage=wren_ui_metadata.toolkit_profiles"
            )
            return {
                "profileId": dto.profile_id,
                "dataSource": ds.value,
                "profile": store.debug_profile(dto.profile_id),
            }
        except Exception as exc:
            return _error_response(exc)

    @app.get("/v1/profiles")
    def get_profiles():
        try:
            return {"profiles": _get_profile_store().list_profile_ids()}
        except Exception as exc:
            return _error_response(exc)

    @app.get("/v1/profiles/{profile_id}")
    def get_profile(profile_id: str):
        try:
            profile = _get_profile_store().debug_profile(profile_id)
            if "error" in profile:
                return _error_response(WrenError(ErrorCode.NOT_FOUND, profile["error"]))
            return profile
        except Exception as exc:
            return _error_response(exc)

    @app.delete("/v1/profiles/{profile_id}")
    def delete_profile(profile_id: str) -> Response:
        try:
            if not _get_profile_store().delete_profile(profile_id):
                return _error_response(
                    WrenError(ErrorCode.NOT_FOUND, f"profile '{profile_id}' not found")
                )
            return Response(status_code=204)
        except Exception as exc:
            return _error_response(exc)


def _get_profile_store() -> PostgresProfileStore:
    global _profile_store
    if _profile_store is None:
        _profile_store = PostgresProfileStore()
    return _profile_store


def _set_profile_store_for_tests(store) -> None:
    global _profile_store
    _profile_store = store


def _register_connector_routes(app: FastAPI, api_prefix: str) -> None:
    connector_prefix = f"{api_prefix}/connector"

    @app.post(f"{connector_prefix}/{{data_source}}/query")
    def query(
        data_source: str,
        dto: QueryDTO,
        dry_run: bool = Query(False, alias="dryRun"),
        cache_enable: bool = Query(False, alias="cacheEnable"),
        override_cache: bool = Query(False, alias="overrideCache"),
        limit: int | None = Query(None),
    ) -> Response:
        del cache_enable, override_cache
        try:
            logger.info(
                "HTTP query requested "
                f"dataSource={data_source} profileId={dto.profile_id or 'inline'} "
                f"dryRun={dry_run} limit={limit} {_manifest_summary(dto.manifest_str)} "
                f'sql="{_preview_sql(dto.sql)}"'
            )
            with _build_engine(data_source, dto) as engine:
                if dry_run:
                    engine.dry_run(dto.sql)
                    logger.info(
                        "HTTP dry_run completed "
                        f"dataSource={data_source} profileId={dto.profile_id or 'inline'}"
                    )
                    return Response(status_code=204)
                table = engine.query(dto.sql, limit=limit)
                rows, columns = _table_shape(table)
                response = ORJSONResponse(_arrow_table_to_legacy_json(table))
                response.headers["X-Cache-Hit"] = "false"
                logger.info(
                    "HTTP query completed "
                    f"dataSource={data_source} profileId={dto.profile_id or 'inline'} "
                    f"rows={rows} columns={columns}"
                )
                return response
        except Exception as exc:
            return _error_response(exc)

    @app.post(f"{connector_prefix}/dry-plan")
    def dry_plan(dto: DryPlanDTO) -> Response:
        try:
            with WrenEngine(dto.manifest_str, DataSource.duckdb, {}) as engine:
                return Response(engine.dry_plan(dto.sql), media_type="text/plain")
        except Exception as exc:
            return _error_response(exc)

    @app.post(f"{connector_prefix}/{{data_source}}/dry-plan")
    def dry_plan_for_data_source(data_source: str, dto: DryPlanDTO) -> Response:
        try:
            ds = _parse_data_source(data_source)
            logger.info(
                "HTTP dry_plan requested "
                f"dataSource={ds.value} {_manifest_summary(dto.manifest_str)} "
                f'sql="{_preview_sql(dto.sql)}"'
            )
            with WrenEngine(dto.manifest_str, ds, {}) as engine:
                planned_sql = engine.dry_plan(dto.sql)
                logger.info(
                    f"HTTP dry_plan completed dataSource={ds.value} "
                    f'plannedSql="{_preview_sql(planned_sql)}"'
                )
                return Response(planned_sql, media_type="text/plain")
        except Exception as exc:
            return _error_response(exc)

    @app.post(f"{connector_prefix}/{{data_source}}/validate/{{rule_name}}")
    def validate(data_source: str, rule_name: str, dto: ValidateDTO) -> Response:
        try:
            if rule_name not in {"column_is_valid", "COLUMN_IS_VALID"}:
                raise WrenError(
                    ErrorCode.VALIDATION_RULE_NOT_FOUND,
                    f"Unsupported validation rule: {rule_name}",
                )
            logger.info(
                "HTTP validation requested "
                f"dataSource={data_source} rule={rule_name} "
                f"profileId={dto.profile_id or 'inline'} {_manifest_summary(dto.manifest_str)}"
            )
            sql = str(
                dto.parameters.get("sql") or dto.parameters.get("expression") or ""
            )
            if sql:
                query_dto = QueryDTO(
                    sql=sql,
                    manifestStr=dto.manifest_str,
                    connectionInfo=dto.connection_info,
                    profileId=dto.profile_id,
                )
                with _build_engine(data_source, query_dto) as engine:
                    engine.dry_plan(sql)
            logger.info(
                "HTTP validation completed "
                f"dataSource={data_source} rule={rule_name} "
                f"profileId={dto.profile_id or 'inline'}"
            )
            return Response(status_code=204)
        except Exception as exc:
            return _error_response(exc)

    @app.post(f"{connector_prefix}/{{data_source}}/model-substitute")
    def model_substitute(data_source: str, dto: TranspileDTO) -> Response:
        try:
            logger.info(
                "HTTP model_substitute requested "
                f"dataSource={data_source} profileId={dto.profile_id or 'inline'} "
                f'sql="{_preview_sql(dto.sql)}"'
            )
            with _build_engine(data_source, dto) as engine:
                engine.dry_run(dto.sql)
            logger.info(
                "HTTP model_substitute completed "
                f"dataSource={data_source} profileId={dto.profile_id or 'inline'}"
            )
            return Response(dto.sql, media_type="text/plain")
        except Exception as exc:
            return _error_response(exc)

    @app.get(f"{connector_prefix}/{{data_source}}/functions")
    def functions(data_source: str) -> list[dict[str, Any]]:
        _parse_data_source(data_source)
        return []

    @app.get(f"{connector_prefix}/{{data_source}}/knowledge")
    def knowledge(data_source: str) -> dict[str, Any]:
        _parse_data_source(data_source)
        return {}

    @app.post(f"{connector_prefix}/{{data_source}}/metadata/tables")
    def metadata_tables(data_source: str, dto: MetadataDTO) -> Response:
        try:
            ds = _parse_data_source(data_source)
            _, connection_info = _resolve_connection_info(ds, dto)
            if ds == DataSource.postgres:
                logger.info(
                    "HTTP metadata/tables requested "
                    f"dataSource={ds.value} profileId={dto.profile_id or 'inline'}"
                )
                tables = _postgres_metadata_tables(connection_info)
                logger.info(
                    "HTTP metadata/tables completed "
                    f"dataSource={ds.value} profileId={dto.profile_id or 'inline'} "
                    f"tables={len(tables)}"
                )
                return ORJSONResponse(tables)
            return _not_implemented_response(
                f"metadata/tables is not implemented for {ds.value} yet"
            )
        except Exception as exc:
            return _error_response(exc)

    @app.post(f"{connector_prefix}/{{data_source}}/metadata/constraints")
    def metadata_constraints(data_source: str, dto: MetadataDTO) -> Response:
        try:
            ds = _parse_data_source(data_source)
            _, connection_info = _resolve_connection_info(ds, dto)
            if ds == DataSource.postgres:
                logger.info(
                    "HTTP metadata/constraints requested "
                    f"dataSource={ds.value} profileId={dto.profile_id or 'inline'}"
                )
                constraints = _postgres_metadata_constraints(connection_info)
                logger.info(
                    "HTTP metadata/constraints completed "
                    f"dataSource={ds.value} profileId={dto.profile_id or 'inline'} "
                    f"constraints={len(constraints)}"
                )
                return ORJSONResponse(constraints)

            logger.info(
                "HTTP metadata/constraints completed "
                f"dataSource={ds.value} profileId={dto.profile_id or 'inline'} "
                "constraints=0 reason=not_implemented"
            )
            return ORJSONResponse([])
        except Exception as exc:
            return _error_response(exc)

    @app.post(f"{connector_prefix}/{{data_source}}/metadata/version")
    def metadata_version(data_source: str, dto: MetadataDTO) -> Response:
        ds = _parse_data_source(data_source)
        logger.info(
            "HTTP metadata/version completed "
            f"dataSource={ds.value} profileId={dto.profile_id or 'inline'} version=unknown"
        )
        return Response("", media_type="text/plain")


def _build_engine(data_source: str, dto: QueryDTO) -> WrenEngine:
    ds = _parse_data_source(data_source)
    profile_ds, connection_info = _resolve_connection_info(ds, dto)
    return WrenEngine(
        dto.manifest_str,
        profile_ds,
        connection_info,
        config=WrenConfig(strict_mode=dto.strict_mode),
    )


def _parse_data_source(value: str) -> DataSource:
    normalized = DATA_SOURCE_ALIASES.get(
        value, DATA_SOURCE_ALIASES.get(value.upper(), value)
    )
    normalized = normalized.replace("-", "_").lower()
    return DataSource(normalized)


def _resolve_connection_info(
    data_source: DataSource, dto: QueryDTO | ValidateDTO | MetadataDTO
) -> tuple[DataSource, dict[str, Any]]:
    if not dto.profile_id:
        logger.debug(f"Using inline connection info dataSource={data_source.value}")
        return data_source, _canonical_connection_info(data_source, dto.connection_info)

    profile = _get_profile_store().get_profile(dto.profile_id)
    if profile is None:
        raise WrenError(ErrorCode.NOT_FOUND, f"profile '{dto.profile_id}' not found")

    expanded = expand_profile_secrets(dict(profile))
    profile_data_source = _parse_data_source(
        expanded.pop("datasource", data_source.value)
    )
    if profile_data_source != data_source:
        raise WrenError(
            ErrorCode.INVALID_CONNECTION_INFO,
            f"profile '{dto.profile_id}' is for datasource '{profile_data_source.value}', "
            f"not '{data_source.value}'",
        )
    logger.info(
        "Toolkit profile resolved "
        f"profileId={dto.profile_id} dataSource={profile_data_source.value} "
        "storage=wren_ui_metadata.toolkit_profiles"
    )
    return profile_data_source, expanded


def _profile_payload(
    data_source: DataSource, connection_info: dict[str, Any]
) -> dict[str, Any]:
    profile = _canonical_connection_info(data_source, connection_info)
    return {"datasource": data_source.value, **profile}


def _canonical_connection_info(
    data_source: DataSource, connection_info: dict[str, Any]
) -> dict[str, Any]:
    if data_source == DataSource.postgres and (
        "connectionUrl" in connection_info or "connection_url" in connection_info
    ):
        return _postgres_profile_from_url(
            connection_info.get("connectionUrl") or connection_info["connection_url"]
        )
    return connection_info


def _postgres_profile_from_url(connection_url: str) -> dict[str, Any]:
    parsed = urlparse(connection_url)
    if parsed.scheme not in {"postgres", "postgresql"}:
        raise WrenError(
            ErrorCode.INVALID_CONNECTION_INFO,
            "Postgres connectionUrl must use postgres:// or postgresql://",
        )
    if not parsed.hostname or not parsed.path.strip("/"):
        raise WrenError(
            ErrorCode.INVALID_CONNECTION_INFO,
            "Postgres connectionUrl must include host and database",
        )

    profile: dict[str, Any] = {
        "host": parsed.hostname,
        "port": str(parsed.port or 5432),
        "database": unquote(parsed.path.lstrip("/")),
        "user": unquote(parsed.username or ""),
    }
    if parsed.password:
        profile["password"] = unquote(parsed.password)

    kwargs = dict(parse_qsl(parsed.query))
    if kwargs:
        profile["kwargs"] = kwargs
    return profile


def _postgres_metadata_tables(connection_info: dict[str, Any]) -> list[dict[str, Any]]:
    logger.info(
        "Postgres metadata query started "
        f"host={connection_info.get('host')} port={connection_info.get('port') or 5432} "
        f"database={connection_info.get('database')}"
    )
    query = """
        WITH primary_keys AS (
            SELECT
                tc.table_schema,
                tc.table_name,
                string_agg(kcu.column_name, ',' ORDER BY kcu.ordinal_position) AS primary_key
            FROM
                information_schema.table_constraints tc
            JOIN
                information_schema.key_column_usage kcu
                ON tc.constraint_catalog = kcu.constraint_catalog
                AND tc.constraint_schema = kcu.constraint_schema
                AND tc.constraint_name = kcu.constraint_name
            WHERE
                tc.constraint_type = 'PRIMARY KEY'
                AND tc.table_schema NOT IN ('information_schema', 'pg_catalog')
            GROUP BY
                tc.table_schema,
                tc.table_name
        )
        SELECT
            t.table_catalog,
            t.table_schema,
            t.table_name,
            c.column_name,
            c.data_type,
            c.is_nullable,
            c.ordinal_position,
            pk.primary_key,
            obj_description(cls.oid) AS table_comment,
            col_description(cls.oid, a.attnum) AS column_comment
        FROM
            information_schema.tables t
        JOIN
            information_schema.columns c
            ON t.table_schema = c.table_schema
            AND t.table_name = c.table_name
        LEFT JOIN
            primary_keys pk
            ON pk.table_schema = t.table_schema
            AND pk.table_name = t.table_name
        LEFT JOIN
            pg_class cls
            ON cls.relname = t.table_name
            AND cls.relnamespace = (
                SELECT oid FROM pg_namespace WHERE nspname = t.table_schema
            )
        LEFT JOIN
            pg_attribute a
            ON a.attrelid = cls.oid
            AND a.attname = c.column_name
        WHERE
            t.table_type IN ('BASE TABLE', 'VIEW')
            AND t.table_schema NOT IN ('information_schema', 'pg_catalog')
        ORDER BY
            t.table_schema,
            t.table_name,
            c.ordinal_position
    """
    with _connect_postgres(connection_info) as conn:
        rows = conn.execute(query).fetchall()
    logger.info(f"Postgres metadata rows fetched rows={len(rows)}")

    tables: dict[str, dict[str, Any]] = {}
    for row in rows:
        schema = row["table_schema"]
        table_name = row["table_name"]
        compact_name = f"{schema}.{table_name}"
        table = tables.setdefault(
            compact_name,
            {
                "name": compact_name,
                "description": row["table_comment"],
                "columns": [],
                "properties": {
                    "schema": schema,
                    "catalog": row["table_catalog"],
                    "table": table_name,
                },
                "primaryKey": row.get("primary_key") or "",
            },
        )
        table["columns"].append(
            {
                "name": row["column_name"],
                "type": str(row["data_type"]).upper(),
                "notNull": str(row["is_nullable"]).lower() == "no",
                "description": row["column_comment"],
                "properties": None,
            }
        )
    result = list(tables.values())
    column_count = sum(len(table["columns"]) for table in result)
    logger.info(
        f"Postgres metadata tables built tables={len(result)} columns={column_count}"
    )
    return result


def _postgres_metadata_constraints(
    connection_info: dict[str, Any],
) -> list[dict[str, str]]:
    logger.info(
        "Postgres constraints query started "
        f"host={connection_info.get('host')} port={connection_info.get('port') or 5432} "
        f"database={connection_info.get('database')}"
    )
    query = """
        SELECT
            tc.constraint_name,
            kcu.table_schema AS constraint_table_schema,
            kcu.table_name AS constraint_table,
            kcu.column_name AS constraint_column,
            ukcu.table_schema AS constrained_table_schema,
            ukcu.table_name AS constrained_table,
            ukcu.column_name AS constrained_column
        FROM
            information_schema.table_constraints tc
        JOIN
            information_schema.key_column_usage kcu
            ON tc.constraint_catalog = kcu.constraint_catalog
            AND tc.constraint_schema = kcu.constraint_schema
            AND tc.constraint_name = kcu.constraint_name
        JOIN
            information_schema.referential_constraints rc
            ON tc.constraint_catalog = rc.constraint_catalog
            AND tc.constraint_schema = rc.constraint_schema
            AND tc.constraint_name = rc.constraint_name
        JOIN
            information_schema.key_column_usage ukcu
            ON ukcu.constraint_catalog = rc.unique_constraint_catalog
            AND ukcu.constraint_schema = rc.unique_constraint_schema
            AND ukcu.constraint_name = rc.unique_constraint_name
            AND ukcu.ordinal_position = kcu.position_in_unique_constraint
        WHERE
            tc.constraint_type = 'FOREIGN KEY'
            AND kcu.table_schema NOT IN ('information_schema', 'pg_catalog')
        ORDER BY
            kcu.table_schema,
            kcu.table_name,
            tc.constraint_name,
            kcu.ordinal_position
    """
    with _connect_postgres(connection_info) as conn:
        rows = conn.execute(query).fetchall()
    logger.info(f"Postgres constraints rows fetched rows={len(rows)}")

    constraints = [
        {
            "constraintName": row["constraint_name"],
            "constraintType": "FOREIGN KEY",
            "constraintTable": (
                f"{row['constraint_table_schema']}.{row['constraint_table']}"
            ),
            "constraintColumn": row["constraint_column"],
            "constraintedTable": (
                f"{row['constrained_table_schema']}.{row['constrained_table']}"
            ),
            "constraintedColumn": row["constrained_column"],
        }
        for row in rows
    ]
    logger.info(f"Postgres constraints built constraints={len(constraints)}")
    return constraints


def _connect_postgres(connection_info: dict[str, Any]):
    kwargs = dict(connection_info.get("kwargs") or {})
    return psycopg.connect(
        host=connection_info.get("host"),
        port=int(connection_info.get("port") or 5432),
        dbname=connection_info.get("database"),
        user=connection_info.get("user"),
        password=connection_info.get("password"),
        **kwargs,
        row_factory=psycopg.rows.dict_row,
    )


def _arrow_table_to_legacy_json(table: Any) -> dict[str, Any]:
    df = table.to_pandas()
    columns = [str(column) for column in df.columns]
    dtypes = {str(column): str(dtype) for column, dtype in df.dtypes.items()}
    data = [
        [_jsonable_value(value) for value in row]
        for row in df.itertuples(index=False, name=None)
    ]
    return {"columns": columns, "data": data, "dtypes": dtypes}


def _jsonable_value(value: Any) -> Any:
    if value is None:
        return None
    try:
        if value != value:
            return None
    except Exception:
        pass
    if isinstance(value, decimal.Decimal):
        return "0" if value == 0 else str(value)
    if isinstance(value, (dt.datetime, dt.date, dt.time)):
        return value.isoformat()
    if isinstance(value, dt.timedelta):
        return str(value)
    if isinstance(value, (bytes, bytearray)):
        return value.hex()
    return value


def _error_response(exc: Exception) -> ORJSONResponse:
    logger.exception(f"HTTP request failed: {exc}")
    if isinstance(exc, WrenError):
        metadata = exc.metadata or {}
        payload = {
            "message": exc.message,
            "errorCode": exc.error_code.name,
            "phase": exc.phase.name if exc.phase else None,
            "metadata": metadata,
        }
        return ORJSONResponse(payload, status_code=_status_for_error(exc))
    return ORJSONResponse({"message": str(exc), "metadata": {DIALECT_SQL: ""}}, 500)


def _status_for_error(error: WrenError) -> int:
    if error.error_code in {
        ErrorCode.INVALID_SQL,
        ErrorCode.INVALID_MDL,
        ErrorCode.INVALID_CONNECTION_INFO,
        ErrorCode.VALIDATION_ERROR,
        ErrorCode.VALIDATION_PARAMETER_ERROR,
        ErrorCode.VALIDATION_RULE_NOT_FOUND,
        ErrorCode.MODEL_NOT_FOUND,
        ErrorCode.BLOCKED_FUNCTION,
    }:
        return 422
    if error.error_code in {ErrorCode.NOT_FOUND, ErrorCode.MDL_NOT_FOUND}:
        return 404
    if error.error_code == ErrorCode.NOT_IMPLEMENTED:
        return 501
    return 500


def _not_implemented_response(message: str) -> ORJSONResponse:
    return ORJSONResponse(
        {
            "message": message,
            "errorCode": ErrorCode.NOT_IMPLEMENTED.name,
            "metadata": {},
        },
        status_code=501,
    )


def main() -> None:
    uvicorn.run("wren.http_api:app", host="0.0.0.0", port=8000)


app = create_app()

__all__ = ["app", "create_app", "main"]
