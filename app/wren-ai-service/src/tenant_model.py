import logging
import os
from contextvars import ContextVar
from typing import Any, Optional

import aiohttp
from cachetools import TTLCache

logger = logging.getLogger("wren-ai-service")

_tenant_id: ContextVar[Optional[str]] = ContextVar("tenant_id", default=None)
_cache: TTLCache = TTLCache(maxsize=1000, ttl=300)
TENANT_MODEL_REQUIRED_MESSAGE = (
    "Link both LLM and Embedder models to this tenant before using AI features."
)


class TenantModelConfigError(RuntimeError):
    pass


def set_tenant_id(tenant_id: Optional[str]):
    return _tenant_id.set(str(tenant_id) if tenant_id else None)


def reset_tenant_id(token):
    _tenant_id.reset(token)


def get_tenant_id() -> Optional[str]:
    return _tenant_id.get()


def get_cached_tenant_model_config(usage_type: str) -> Optional[dict[str, Any]]:
    tenant_id = get_tenant_id()
    if not tenant_id:
        return None
    return _cache.get(f"{tenant_id}:{usage_type}")


def get_tenant_embedding_dimension(default: Optional[int] = None) -> Optional[int]:
    config = get_cached_tenant_model_config("embedding")
    if not config:
        return default

    dimension = config.get("dimension")
    if not dimension:
        return default

    try:
        return int(dimension)
    except (TypeError, ValueError):
        return default


def invalidate_tenant_model_cache(tenant_id: Optional[str] = None) -> int:
    if not tenant_id:
        size = len(_cache)
        _cache.clear()
        return size

    prefix = f"{tenant_id}:"
    keys = [key for key in _cache.keys() if str(key).startswith(prefix)]
    for key in keys:
        _cache.pop(key, None)
    return len(keys)


def _wren_ui_endpoint() -> Optional[str]:
    endpoint = os.getenv("WREN_UI_ENDPOINT")
    return endpoint.rstrip("/") if endpoint else None


async def get_tenant_model_config(usage_type: str) -> Optional[dict[str, Any]]:
    tenant_id = get_tenant_id()
    endpoint = _wren_ui_endpoint()
    token = os.getenv("WREN_UI_INTERNAL_API_TOKEN")

    if not tenant_id or not endpoint or not token:
        return None

    cache_key = f"{tenant_id}:{usage_type}"
    if cache_key in _cache:
        return _cache[cache_key]

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{endpoint}/api/internal/tenant-model-config",
                params={"tenantId": tenant_id},
                headers={"X-Wren-UI-Internal-API-Token": token},
                timeout=aiohttp.ClientTimeout(total=10),
            ) as response:
                if response.status != 200:
                    logger.warning(
                        "Tenant model config lookup failed "
                        f"tenantId={tenant_id} status={response.status}"
                    )
                    return None
                payload = await response.json()
    except Exception as exc:
        logger.warning(
            f"Tenant model config lookup failed tenantId={tenant_id}: {exc}"
        )
        return None

    config = payload.get(usage_type.lower())
    _cache[cache_key] = config
    return config


async def require_tenant_model_config(usage_type: str) -> dict[str, Any]:
    config = await get_tenant_model_config(usage_type)
    if not config:
        tenant_id = get_tenant_id()
        raise TenantModelConfigError(
            f"{TENANT_MODEL_REQUIRED_MESSAGE} tenantId={tenant_id}"
        )
    return config
