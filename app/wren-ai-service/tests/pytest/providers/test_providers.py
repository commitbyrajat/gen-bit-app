from types import SimpleNamespace

import pytest
from pytest_mock import MockerFixture

from src.core.engine import Engine
from src.core.pipeline import PipelineComponent
from src.core.provider import DocumentStoreProvider, EmbedderProvider, LLMProvider
from src.providers import Configuration, generate_components, transform
from src.providers.llm.litellm import LitellmLLMProvider


def test_transform():
    config = [
        {
            "type": "llm",
            "provider": "openai_llm",
            "models": [
                {"model": "gpt-4", "kwargs": {"temperature": 0, "max_tokens": 4096}}
            ],
        },
        {
            "type": "embedder",
            "provider": "openai_embedder",
            "models": [{"model": "text-embedding-ada-002", "dimension": 1536}],
        },
        {
            "type": "document_store",
            "provider": "qdrant",
            "kwargs": {"host": "localhost", "port": 6333},
        },
        {
            "type": "engine",
            "provider": "wren_ui",
            "kwargs": {"host": "localhost", "port": 8000},
        },
        {
            "type": "pipeline",
            "pipes": [
                {
                    "name": "indexing",
                    "llm": "openai_llm.gpt-4",
                    "embedder": "openai_embedder.text-embedding-ada-002",
                    "document_store": "qdrant",
                    "engine": "wren_ui",
                }
            ],
        },
    ]

    result = transform(config)

    assert isinstance(result, Configuration)
    assert "openai_llm.gpt-4" in result.providers["llm"]
    assert "openai_embedder.text-embedding-ada-002" in result.providers["embedder"]
    assert "qdrant" in result.providers["document_store"]
    assert "wren_ui" in result.providers["engine"]
    assert "indexing" in result.pipelines


def test_generate_components(mocker: MockerFixture):
    # Mock the provider_factory to return mock objects
    mocker.patch(
        "src.providers.provider_factory",
        side_effect=[
            mocker.Mock(spec=EmbedderProvider),
            mocker.Mock(spec=LLMProvider),
            mocker.Mock(spec=DocumentStoreProvider),
            mocker.Mock(spec=Engine),
        ],
    )

    config = [
        {
            "type": "llm",
            "provider": "openai_llm",
            "models": [{"model": "gpt-4", "kwargs": {}}],
        },
        {
            "type": "embedder",
            "provider": "openai_embedder",
            "models": [{"model": "text-embedding-ada-002", "dimension": 1536}],
        },
        {"type": "document_store", "provider": "qdrant", "kwargs": {}},
        {"type": "engine", "provider": "wren_ui", "kwargs": {}},
        {
            "type": "pipeline",
            "pipes": [
                {
                    "name": "indexing",
                    "llm": "openai_llm.gpt-4",
                    "embedder": "openai_embedder.text-embedding-ada-002",
                    "document_store": "qdrant",
                    "engine": "wren_ui",
                }
            ],
        },
    ]

    result = generate_components(config)

    assert "indexing" in result
    assert isinstance(result["indexing"], PipelineComponent)
    assert isinstance(result["indexing"].embedder_provider, EmbedderProvider)
    assert isinstance(result["indexing"].llm_provider, LLMProvider)
    assert isinstance(result["indexing"].document_store_provider, DocumentStoreProvider)
    assert isinstance(result["indexing"].engine, Engine)


@pytest.mark.asyncio
async def test_litellm_min_output_tokens_bumps_max_tokens(mocker: MockerFixture):
    captured_kwargs = {}

    async def fake_acompletion(**kwargs):
        captured_kwargs.update(kwargs)
        return SimpleNamespace(
            model="gpt-test",
            choices=[
                SimpleNamespace(
                    index=0,
                    finish_reason="stop",
                    message=SimpleNamespace(content='{"sql":"SELECT 1"}'),
                )
            ],
            usage={},
        )

    mocker.patch(
        "src.providers.llm.litellm.acompletion",
        side_effect=fake_acompletion,
    )

    provider = LitellmLLMProvider(
        model="gpt-test",
        kwargs={"max_tokens": 4096, "temperature": 0},
    )
    generator = provider.get_generator(generation_kwargs={"min_output_tokens": 8192})

    await generator(prompt="Generate SQL")

    assert captured_kwargs["max_tokens"] == 8192
    assert "min_output_tokens" not in captured_kwargs
