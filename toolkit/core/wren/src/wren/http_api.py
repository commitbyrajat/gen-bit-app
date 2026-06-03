"""HTTP compatibility API for the legacy ibis-server connector contract."""

from __future__ import annotations

import datetime as dt
import decimal
from typing import Any

import uvicorn
from fastapi import FastAPI, Query, Response
from fastapi.responses import ORJSONResponse
from pydantic import BaseModel, Field

from wren import __version__
from wren.engine import WrenEngine
from wren.model.data_source import DataSource
from wren.model.error import DIALECT_SQL, ErrorCode, WrenError


class QueryDTO(BaseModel):
    sql: str
    manifest_str: str = Field(alias="manifestStr")
    connection_info: dict[str, Any] = Field(default_factory=dict, alias="connectionInfo")


class DryPlanDTO(BaseModel):
    sql: str
    manifest_str: str = Field(alias="manifestStr")


class MetadataDTO(BaseModel):
    connection_info: dict[str, Any] = Field(default_factory=dict, alias="connectionInfo")


class ValidateDTO(BaseModel):
    manifest_str: str = Field(alias="manifestStr")
    connection_info: dict[str, Any] = Field(default_factory=dict, alias="connectionInfo")
    parameters: dict[str, Any] = Field(default_factory=dict)


class TranspileDTO(QueryDTO):
    pass


DATA_SOURCE_ALIASES = {
    "ATHENA": "athena",
    "BIG_QUERY": "bigquery",
    "BIGQUERY": "bigquery",
    "CLICK_HOUSE": "clickhouse",
    "CLICKHOUSE": "clickhouse",
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
        return {"version": __version__, "compatibility": "ibis-server"}

    for prefix in ("/v2", "/v3"):
        _register_connector_routes(app, prefix)

    return app


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
            with _build_engine(data_source, dto) as engine:
                if dry_run:
                    engine.dry_run(dto.sql)
                    return Response(status_code=204)
                table = engine.query(dto.sql, limit=limit)
                response = ORJSONResponse(_arrow_table_to_legacy_json(table))
                response.headers["X-Cache-Hit"] = "false"
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
            with WrenEngine(dto.manifest_str, ds, {}) as engine:
                return Response(engine.dry_plan(dto.sql), media_type="text/plain")
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
            sql = str(dto.parameters.get("sql") or dto.parameters.get("expression") or "")
            if sql:
                query_dto = QueryDTO(
                    sql=sql,
                    manifestStr=dto.manifest_str,
                    connectionInfo=dto.connection_info,
                )
                with _build_engine(data_source, query_dto) as engine:
                    engine.dry_plan(sql)
            return Response(status_code=204)
        except Exception as exc:
            return _error_response(exc)

    @app.post(f"{connector_prefix}/{{data_source}}/model-substitute")
    def model_substitute(data_source: str, dto: TranspileDTO) -> Response:
        try:
            with _build_engine(data_source, dto) as engine:
                engine.dry_run(dto.sql)
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
        del dto
        _parse_data_source(data_source)
        return _not_implemented_response("metadata/tables is not implemented yet")

    @app.post(f"{connector_prefix}/{{data_source}}/metadata/constraints")
    def metadata_constraints(data_source: str, dto: MetadataDTO) -> Response:
        del dto
        _parse_data_source(data_source)
        return ORJSONResponse([])

    @app.post(f"{connector_prefix}/{{data_source}}/metadata/version")
    def metadata_version(data_source: str, dto: MetadataDTO) -> Response:
        del dto
        _parse_data_source(data_source)
        return Response("", media_type="text/plain")


def _build_engine(data_source: str, dto: QueryDTO) -> WrenEngine:
    return WrenEngine(
        dto.manifest_str,
        _parse_data_source(data_source),
        dto.connection_info,
    )


def _parse_data_source(value: str) -> DataSource:
    normalized = DATA_SOURCE_ALIASES.get(value, DATA_SOURCE_ALIASES.get(value.upper(), value))
    normalized = normalized.replace("-", "_").lower()
    return DataSource(normalized)


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
