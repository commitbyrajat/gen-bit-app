import os

from fastapi import Request
from litellm.proxy._types import ProxyException, UserAPIKeyAuth


def _client_key_model_map() -> dict[str, list[str]]:
    return {
        os.environ["CLIENT_LLM_GEMINI_FLASH_API_KEY"]: ["gemini-2.5-flash"],
        os.environ["CLIENT_LLM_GEMINI_FLASH_TEST_API_KEY"]: ["gemini-2.5-flash-test"],
        os.environ["CLIENT_EMBED_BGE_M3_API_KEY"]: ["BAAI/bge-m3"],
        os.environ["CLIENT_EMBED_BGE_M3_TEST_API_KEY"]: ["BAAI/bge-m3-test"],
    }


async def user_api_key_auth(request: Request, api_key: str) -> UserAPIKeyAuth:
    allowed_models = _client_key_model_map().get(api_key)
    if not allowed_models:
        raise ProxyException(
            message="Invalid LiteLLM client API key",
            type="authentication_error",
            param="api_key",
            code=401,
        )

    return UserAPIKeyAuth(api_key=api_key, models=allowed_models)
