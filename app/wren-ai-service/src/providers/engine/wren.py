import asyncio
import base64
import hashlib
import logging
import os
from typing import Any, Dict, Optional, Tuple

import aiohttp
import orjson

from src.config import settings
from src.core.engine import Engine, remove_limit_statement
from src.providers.loader import provider

logger = logging.getLogger("wren-ai-service")


def _preview_sql(sql: str, max_len: int = 240) -> str:
    return " ".join(sql.split())[:max_len]


def _manifest_summary(manifest: str | None) -> str:
    if not manifest:
        return "manifestHash=none models=0 relationships=0 views=0"
    digest = hashlib.sha256(manifest.encode()).hexdigest()[:12]
    try:
        parsed = orjson.loads(base64.b64decode(manifest))
    except Exception:
        return f"manifestHash={digest} models=unknown relationships=unknown views=unknown"
    return (
        f"manifestHash={digest} models={len(parsed.get('models', []))} "
        f"relationships={len(parsed.get('relationships', []))} "
        f"views={len(parsed.get('views', []))}"
    )


@provider("wren_ui")
class WrenUI(Engine):
    def __init__(
        self,
        endpoint: str = os.getenv("WREN_UI_ENDPOINT"),
        **_,
    ):
        self._endpoint = endpoint
        self._internal_api_token = os.getenv("WREN_UI_INTERNAL_API_TOKEN")
        logger.info(
            "WrenUI engine initialized "
            f"endpoint={self._endpoint} internalAuthConfigured={bool(self._internal_api_token)}"
        )

    async def execute_sql(
        self,
        sql: str,
        session: aiohttp.ClientSession,
        project_id: str | None = None,
        dry_run: bool = True,
        timeout: float = settings.engine_timeout,
        limit: int = 500,
        **kwargs,
    ) -> Tuple[bool, Optional[Dict[str, Any]], Optional[Dict[str, Any]]]:
        log_error = kwargs.get("log_error", True)
        data = {
            "sql": remove_limit_statement(sql),
            "projectId": project_id,
        }
        if dry_run:
            data["dryRun"] = True
            data["limit"] = 1
        else:
            data["limit"] = limit

        try:
            logger.info(
                "WrenUI execute_sql requested "
                f"projectId={project_id} dryRun={dry_run} limit={data.get('limit')} "
                f"sql=\"{_preview_sql(sql)}\""
            )
            headers = (
                {"X-Wren-UI-Internal-API-Token": self._internal_api_token}
                if self._internal_api_token
                else None
            )
            async with session.post(
                f"{self._endpoint}/api/graphql",
                json={
                    "query": "mutation PreviewSql($data: PreviewSQLDataInput) { previewSql(data: $data) }",
                    "variables": {"data": data},
                },
                headers=headers,
                timeout=aiohttp.ClientTimeout(total=timeout),
            ) as response:
                res_json = await response.json()
                if res_data := res_json.get("data"):
                    res = res_data.get("previewSql", {}) if res_data else {}
                    if dry_run:
                        logger.info(
                            "WrenUI execute_sql dry_run completed "
                            f"projectId={project_id} correlationId={res_json.get('correlationId', '')}"
                        )
                        return (
                            True,
                            res,
                            {
                                "correlation_id": res_json.get("correlationId", ""),
                            },
                        )

                    data = res.get("data", []) if res else []
                    if len(data) > 0:
                        logger.info(
                            "WrenUI execute_sql query completed "
                            f"projectId={project_id} rows={len(data)} "
                            f"correlationId={res_json.get('correlationId', '')}"
                        )
                        return (
                            True,
                            res,
                            {
                                "correlation_id": res_json.get("correlationId", ""),
                            },
                        )

                    logger.info(
                        "WrenUI execute_sql query completed "
                        f"projectId={project_id} rows=0 "
                        f"correlationId={res_json.get('correlationId', '')}"
                    )
                    return (
                        False,
                        res,
                        {
                            "correlation_id": res_json.get("correlationId", ""),
                        },
                    )

                error_message = res_json.get("errors", [{}])[0].get(
                    "message", "Unknown error"
                )
                if log_error:
                    logger.error(f"Error executing SQL: {error_message}")
                else:
                    logger.info(
                        "WrenUI execute_sql validation failed "
                        f"projectId={project_id} dryRun={dry_run} "
                        f"error=\"{error_message}\" sql=\"{_preview_sql(sql)}\""
                    )
                dialect_sql = (
                    (
                        (
                            (res_json.get("errors", [{}])[0] or {}).get(
                                "extensions", {}
                            )
                            or {}
                        ).get("other", {})
                        or {}
                    ).get("metadata", {})
                    or {}
                ).get("dialectSql", "") or ""
                planned_sql = (
                    (
                        (
                            (res_json.get("errors", [{}])[0] or {}).get(
                                "extensions", {}
                            )
                            or {}
                        ).get("other", {})
                        or {}
                    ).get("metadata", {})
                    or {}
                ).get("plannedSql", "") or ""

                return (
                    False,
                    {},
                    {
                        "error_message": error_message,
                        "error_sql": dialect_sql or planned_sql or sql,
                        "correlation_id": (
                            (
                                (
                                    (res_json.get("errors", [{}])[0] or {}).get(
                                        "extensions", {}
                                    )
                                    or {}
                                ).get("other", {})
                                or {}
                            ).get("correlationId")
                            or ""
                        ),
                    },
                )
        except asyncio.TimeoutError:
            return (
                False,
                {},
                {"error_message": f"Request timed out: {timeout} seconds"},
            )


@provider("wren_toolkit")
class WrenToolkit(Engine):
    def __init__(
        self,
        endpoint: str = os.getenv("WREN_TOOLKIT_ENDPOINT", "http://localhost:8000"),
        source: str = os.getenv("WREN_TOOLKIT_SOURCE"),
        manifest: str = os.getenv("WREN_TOOLKIT_MANIFEST"),
        connection_info: str = os.getenv("WREN_TOOLKIT_CONNECTION_INFO"),
        **_,
    ):
        self._endpoint = endpoint
        self._source = source
        self._manifest = manifest
        self._connection_info = (
            orjson.loads(base64.b64decode(connection_info)) if connection_info else {}
        )
        logger.info(
            "WrenToolkit engine initialized "
            f"endpoint={self._endpoint} source={self._source} "
            f"{_manifest_summary(self._manifest)} "
            f"connectionKeys={sorted(self._connection_info.keys())}"
        )

    async def execute_sql(
        self,
        sql: str,
        session: aiohttp.ClientSession,
        dry_run: bool = True,
        timeout: float = settings.engine_timeout,
        limit: int = 500,
        **kwargs,
    ) -> Tuple[bool, Optional[Dict[str, Any]]]:
        log_error = kwargs.get("log_error", True)
        api_endpoint = f"{self._endpoint}/v3/connector/{self._source}/query"
        if dry_run:
            api_endpoint += "?dryRun=true&limit=1"
        else:
            api_endpoint += f"?limit={limit}"

        try:
            logger.info(
                "WrenToolkit execute_sql requested "
                f"source={self._source} dryRun={dry_run} limit={limit} "
                f"endpoint={api_endpoint} sql=\"{_preview_sql(sql)}\""
            )
            async with session.post(
                api_endpoint,
                json={
                    "sql": remove_limit_statement(sql),
                    "manifestStr": self._manifest,
                    "connectionInfo": self._connection_info,
                },
                timeout=aiohttp.ClientTimeout(total=timeout),
            ) as response:
                if dry_run:
                    res = await response.text()
                else:
                    res = await response.json()

                if response.status == 200 or response.status == 204:
                    logger.info(
                        "WrenToolkit execute_sql completed "
                        f"source={self._source} dryRun={dry_run} status={response.status}"
                    )
                    return (
                        True,
                        res,
                        {
                            "correlation_id": "",
                        },
                    )

                log = logger.error if log_error else logger.info
                log(
                    "WrenToolkit execute_sql failed "
                    f"source={self._source} dryRun={dry_run} status={response.status}"
                )
                return (
                    False,
                    None,
                    {
                        "error_message": res,
                        "correlation_id": "",
                    },
                )
        except asyncio.TimeoutError:
            return False, None, f"Request timed out: {timeout} seconds"

    async def dry_plan(
        self,
        session: aiohttp.ClientSession,
        sql: str,
        data_source: str,
        timeout: float = settings.engine_timeout,
        allow_fallback: bool = True,
        **kwargs,
    ) -> Tuple[bool, str]:
        api_endpoint = f"{self._endpoint}/v3/connector/{data_source}/dry-plan"
        try:
            logger.info(
                "WrenToolkit dry_plan requested "
                f"dataSource={data_source} allowFallback={allow_fallback} "
                f"endpoint={api_endpoint} sql=\"{_preview_sql(sql)}\""
            )
            async with session.post(
                api_endpoint,
                headers={
                    "x-wren-fallback_disable": "false" if allow_fallback else "true",
                },
                json={
                    "sql": sql,
                    "manifestStr": self._manifest,
                },
                timeout=aiohttp.ClientTimeout(total=timeout),
            ) as response:
                res = await response.text()

                if response.status != 200:
                    raise Exception(f"Request failed with message: {res}")

                logger.info(
                    f"WrenToolkit dry_plan completed dataSource={data_source} status={response.status}"
                )
                return True, ""
        except asyncio.TimeoutError:
            logger.error(f"Request timed out: {timeout} seconds")
            return False, f"Request timed out: {timeout} seconds"
        except Exception as e:
            logger.exception(f"Unexpected error during dry_plan: {str(e)}")
            return False, f"Unexpected error during dry_plan: {str(e)}"

    async def get_func_list(
        self,
        session: aiohttp.ClientSession,
        data_source: str,
        timeout: float = settings.engine_timeout,
    ) -> list[str]:
        api_endpoint = f"{self._endpoint}/v3/connector/{data_source}/functions"
        try:
            logger.info(
                f"WrenToolkit functions requested dataSource={data_source} endpoint={api_endpoint}"
            )
            async with session.get(api_endpoint, timeout=timeout) as response:
                res = await response.json()

                if response.status != 200:
                    raise Exception(f"Request failed with message: {res}")

                logger.info(
                    f"WrenToolkit functions completed dataSource={data_source} count={len(res)}"
                )
                return res
        except asyncio.TimeoutError:
            logger.error(f"Request timed out: {timeout} seconds")
            return []
        except Exception as e:
            logger.exception(f"Unexpected error during get_func_list: {str(e)}")
            return []

    async def get_sql_knowledge(
        self,
        session: aiohttp.ClientSession,
        data_source: str,
        timeout: float = settings.engine_timeout,
    ) -> Optional[Dict[str, Any]]:
        api_endpoint = f"{self._endpoint}/v3/connector/{data_source}/knowledge"
        try:
            logger.info(
                f"WrenToolkit knowledge requested dataSource={data_source} endpoint={api_endpoint}"
            )
            async with session.get(api_endpoint, timeout=timeout) as response:
                res = await response.json()

                if response.status != 200:
                    raise Exception(f"Request failed with message: {res}")

                logger.info(
                    "WrenToolkit knowledge completed "
                    f"dataSource={data_source} keys={sorted(res.keys()) if isinstance(res, dict) else []}"
                )
                return res
        except asyncio.TimeoutError:
            logger.error(f"Request timed out: {timeout} seconds")
            return None
        except Exception as e:
            logger.exception(f"Unexpected error during get_sql_knowledge: {str(e)}")
            return None
