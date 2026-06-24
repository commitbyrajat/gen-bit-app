import os
from typing import Optional

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel

from src.tenant_model import invalidate_tenant_model_cache

router = APIRouter()


class InvalidateTenantModelCacheRequest(BaseModel):
    tenant_id: Optional[str] = None


class InvalidateTenantModelCacheResponse(BaseModel):
    invalidated: int


@router.post("/tenant-model-cache/invalidate")
async def invalidate_cache(
    request: InvalidateTenantModelCacheRequest,
    x_wren_ui_internal_api_token: Optional[str] = Header(default=None),
) -> InvalidateTenantModelCacheResponse:
    token = os.getenv("WREN_UI_INTERNAL_API_TOKEN")
    if token and x_wren_ui_internal_api_token != token:
        raise HTTPException(status_code=403, detail="Forbidden")

    return InvalidateTenantModelCacheResponse(
        invalidated=invalidate_tenant_model_cache(request.tenant_id)
    )
