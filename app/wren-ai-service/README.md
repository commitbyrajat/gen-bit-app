# AI Service of Wren AI

## Concepts

Please read the [documentation](https://docs.getwren.ai/oss/concept/wren_ai_service) here to understand the concepts of Wren AI Service.

## Setup for Local Development

### Prerequisites

1. **Python**: Install Python 3.12.\*

   - Recommended: Use [`pyenv`](https://github.com/pyenv/pyenv?tab=readme-ov-file#installation) to manage Python versions

2. **Poetry**: Install Poetry 1.8.3

   ```bash
   curl -sSL https://install.python-poetry.org | python3 - --version 1.8.3
   ```

3. **Just**: Install [Just](https://github.com/casey/just?tab=readme-ov-file#packages) command runner (version 1.36 or higher)

### Step-by-Step Setup

1. **Install Dependencies**:

   ```bash
   poetry install
   ```

2. **Generate Configuration Files**:

   ```bash
   just init
   ```

   This creates both `.env.dev` and `config.yaml`. Use `just init --non-dev` to generate only `config.yaml`.

    > For Windows, add the line `set shell:= ["bash", "-cu"]` at the start of the Justfile.

4. **Configure Environment**:

   - Edit `.env.dev` to set environment variables
   - Modify `config.yaml` to configure components, pipelines, and other settings
   - Refer to [AI Service Configuration](./docs/configuration.md) for detailed setup instructions
   - The default `config.yaml` expects the toolkit HTTP compatibility API at `http://localhost:8000` via the `wren_toolkit` engine provider. Start it from `toolkit/core/wren` with `just dev-http`.

5. **Set Up Development Environment** (optional):

   - Install pre-commit hooks:

     ```bash
     poetry run pre-commit install
     ```

   - Run initial pre-commit checks:

     ```bash
     poetry run pre-commit run --all-files
     ```

6. **Run Tests** (optional):

   ```bash
   just test
   ```

### Starting the Service

1. **Start Toolkit HTTP Compatibility API**:

   ```bash
   cd ../../toolkit/core/wren
   just dev-http
   ```

2. **Start Required Containers**:

   ```bash
   just up
   ```

3. **Launch the AI Service**:

   ```bash
   just start
   ```

4. **Access the Service**:

   - API Documentation: `http://WREN_AI_SERVICE_HOST:WREN_AI_SERVICE_PORT` (default: <http://localhost:5556>)
   - User Interface: `http://WREN_UI_HOST:WREN_UI_PORT` (default: <http://localhost:3000>)

5. **Stop the Service**:
   When finished, stop the containers:

   ```bash
   just down
   ```

This setup ensures a consistent development environment and helps maintain code quality through pre-commit hooks and tests. Follow these steps to get started with local development of the Wren AI Service.

## Environment Variables

`src/config.py` loads `.env.dev`, process environment variables, and then `config.yaml`. Values under the `settings:` document in `config.yaml` override matching settings from environment variables. Component blocks in `config.yaml` can also provide values such as model names, provider endpoints, and Qdrant location; the environment variables below are the runtime knobs read directly by the service or by the local Docker/dev tooling.

### Required For The Default Local Stack

| Variable | Required when | Default | Description |
| --- | --- | --- | --- |
| `OPENAI_API_KEY` | Using the default `config.yaml` with OpenAI models or embeddings. | None | API key consumed by LiteLLM for the default `gpt-*` and `text-embedding-*` models. |
| `QDRANT_HOST` | Running the Docker entrypoint or using Qdrant without overriding the document-store `location` in `config.yaml`. | `qdrant` in provider code; local `config.yaml` uses `http://localhost:6333`. | Qdrant host or URL used by the document store and container readiness check. |
| `WREN_AI_SERVICE_PORT` | Running the Docker entrypoint or exposing the service on a non-default port. | `5555` in Python settings; local `config.yaml` sets `5556`. | Port used by the AI service. The container entrypoint passes this to `uvicorn`. |
| `WREN_UI_ENDPOINT` | Using the `wren_ui` engine provider without setting `endpoint` in `config.yaml`, or running force deploy. | `http://wren-ui:3000` only in `force_deploy.py`; no provider default. | Wren UI base URL used for GraphQL execution. |
| `WREN_TOOLKIT_ENDPOINT` | Using the `wren_toolkit` engine provider without setting `endpoint` in `config.yaml`. | `http://localhost:8000` | Wren toolkit HTTP compatibility API base URL. |

### Core Service Settings

These can be supplied as environment variables, but most are usually set in `config.yaml` under `settings:`.

| Variable | Default | Description |
| --- | --- | --- |
| `WREN_AI_SERVICE_HOST` | `127.0.0.1` | Host used when running `python -m src.__main__`. Containers use `0.0.0.0` in `entrypoint.sh`. |
| `WREN_AI_SERVICE_PORT` | `5555` | Service port. |
| `CONFIG_PATH` | `config.yaml` | YAML configuration file path. |
| `SQL_PAIRS_PATH` | `sql_pairs.json` | SQL-pair seed file path. |
| `LOGGING_LEVEL` | `INFO` | Python logging level, for example `DEBUG`, `INFO`, or `WARNING`. |
| `DEVELOPMENT` | `false` | Enables reload and development routes when running from Python. |
| `IS_OSS` | `true` | Controls OSS-specific behavior in prompts and guides. |
| `DOC_ENDPOINT` | `https://docs.getwren.ai` | Documentation base URL used by guide assistance. |
| `QUERY_CACHE_TTL` | `3600` | Query cache TTL in seconds. |
| `QUERY_CACHE_MAXSIZE` | `1000000` | Query cache max size. |
| `ENGINE_TIMEOUT` | `30.0` | Timeout in seconds for engine calls. |

### Retrieval And Generation Settings

| Variable | Default | Description |
| --- | --- | --- |
| `COLUMN_INDEXING_BATCH_SIZE` | `50` | Batch size for column indexing. |
| `TABLE_RETRIEVAL_SIZE` | `10` | Number of tables retrieved for schema retrieval. |
| `TABLE_COLUMN_RETRIEVAL_SIZE` | `100` | Number of table columns retrieved. |
| `ENABLE_COLUMN_PRUNING` | `false` | Enables column pruning. |
| `HISTORICAL_QUESTION_RETRIEVAL_SIMILARITY_THRESHOLD` | `0.9` | Similarity threshold for historical question retrieval. |
| `SQL_PAIRS_SIMILARITY_THRESHOLD` | `0.7` | Similarity threshold for SQL-pair retrieval. |
| `SQL_PAIRS_RETRIEVAL_MAX_SIZE` | `10` | Maximum SQL pairs to retrieve. |
| `INSTRUCTIONS_SIMILARITY_THRESHOLD` | `0.7` | Similarity threshold for instruction retrieval. |
| `INSTRUCTIONS_TOP_K` | `10` | Number of instructions to retrieve. |
| `ALLOW_INTENT_CLASSIFICATION` | `true` | Enables intent classification. |
| `ALLOW_SQL_GENERATION_REASONING` | `true` | Enables SQL generation reasoning. |
| `ALLOW_SQL_FUNCTIONS_RETRIEVAL` | `true` | Enables SQL function retrieval through toolkit. |
| `ALLOW_SQL_DIAGNOSIS` | `true` | Enables SQL diagnosis. |
| `ALLOW_SQL_KNOWLEDGE_RETRIEVAL` | `false` | Enables SQL knowledge retrieval through toolkit. |
| `MAX_HISTORIES` | `5` | Maximum conversation history items considered by generation. |
| `MAX_SQL_CORRECTION_RETRIES` | `3` | Maximum SQL correction retries. |

### Provider, Engine, And Document Store Variables

| Variable | Default | Description |
| --- | --- | --- |
| `WREN_UI_ENDPOINT` | None | Base URL for the `wren_ui` engine provider. Usually set in `config.yaml` as the engine `endpoint`. |
| `WREN_UI_INTERNAL_API_TOKEN` | None | Optional internal API token sent as `X-Wren-UI-Internal-API-Token` to Wren UI GraphQL calls. |
| `WREN_TOOLKIT_ENDPOINT` | `http://localhost:8000` | Base URL for the `wren_toolkit` engine provider. |
| `WREN_TOOLKIT_SOURCE` | None | Datasource name used by `wren_toolkit` when not provided by config. |
| `WREN_TOOLKIT_MANIFEST` | None | Base64-encoded MDL manifest used by `wren_toolkit` when not provided by request/config. |
| `WREN_TOOLKIT_CONNECTION_INFO` | None | Base64-encoded JSON connection info used by `wren_toolkit`. |
| `QDRANT_HOST` | `qdrant` | Qdrant host or URL for the Qdrant document store provider. |
| `QDRANT_API_KEY` | None | Optional Qdrant API key. |
| `QDRANT_TIMEOUT` | `120` | Qdrant request timeout in seconds. |
| `EMBEDDING_MODEL_DIMENSION` | `0` | Embedding vector size when not supplied in `config.yaml`. For OpenAI `text-embedding-3-large`, use `3072`. |
| `SHOULD_FORCE_DEPLOY` | unset | When set, resets Qdrant indexes and makes the container entrypoint wait for Wren UI, then run `src.force_deploy`. |
| `ENGINE` | `wren_ui` | Used by `src.force_deploy` to decide whether to trigger Wren UI deployment. |

### LLM, Embedder, And Observability Keys

LiteLLM provider blocks can set `api_key_name`; the service reads the environment variable named there. The exact key depends on the model provider configured in `config.yaml`.

When chat and embedding models are exposed through a LiteLLM proxy, use LiteLLM's proxy provider route by setting the model names in `config.yaml` with the `litellm_proxy/` prefix. LiteLLM reads the proxy base URL and API key from environment variables, but it does not expose a native model-name environment variable; Wren AI Service model names come from the `model:` fields in the LiteLLM `llm` and `embedder` component blocks.

| Variable | Required when | Description |
| --- | --- | --- |
| `LITELLM_PROXY_API_BASE` | Calling models through LiteLLM proxy using `litellm_proxy/<model>`. | Base URL of the LiteLLM proxy, for example `http://litellm-proxy:4000`. |
| `LITELLM_PROXY_API_KEY` | LiteLLM proxy requires authentication. | API key/token sent to the LiteLLM proxy. |
| `USE_LITELLM_PROXY` | Optional. | Set to `True` only if you want LiteLLM SDK calls routed through the proxy even when the model name does not use the `litellm_proxy/` prefix. |

Example LiteLLM proxy model configuration:

```yaml
models:
  - alias: default
    model: litellm_proxy/gemini-2.5-flash
    kwargs:
      temperature: 0
      n: 1
      max_tokens: 4096
provider: litellm_llm
type: llm
---
models:
  - alias: default
    model: litellm_proxy/BAAI/bge-m3
    timeout: 120
provider: litellm_embedder
type: embedder
```

| Variable | Required when | Description |
| --- | --- | --- |
| `OPENAI_API_KEY` | OpenAI or OpenAI-compatible models/embeddings. | OpenAI API key. |
| `ANTHROPIC_API_KEY` | Anthropic models. | Anthropic API key. |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI models. | Azure OpenAI API key. |
| `GEMINI_API_KEY` | Google AI Studio Gemini models. | Gemini API key. |
| `GOOGLE_APPLICATION_CREDENTIALS` | Google Vertex AI. | Path to Google service-account credentials JSON. |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` | AWS Bedrock. | AWS credentials used by LiteLLM/Boto provider chain. |
| `GROQ_API_KEY` | Groq models. | Groq API key. |
| `DEEPSEEK_API_KEY` | DeepSeek models. | DeepSeek API key. |
| `OPENROUTER_API_KEY` | OpenRouter models. | OpenRouter API key. |
| `XAI_API_KEY` | xAI/Grok models. | xAI API key. |
| `LM_STUDIO_API_KEY` | LM Studio-compatible endpoint. | Any non-empty key expected by the local endpoint. |
| `LANGFUSE_PUBLIC_KEY` | Langfuse tracing enabled. | Langfuse public key. |
| `LANGFUSE_SECRET_KEY` | Langfuse tracing enabled. | Langfuse secret key. |
| `LANGFUSE_PROJECT_ID` | Evaluation workflows. | Langfuse project id used by evaluation tooling. |
| `LANGFUSE_HOST` | Optional | Prefer `langfuse_host` in `config.yaml`; default is `https://cloud.langfuse.com`. |
| `LANGFUSE_ENABLE` | Optional | Prefer `langfuse_enable` in `config.yaml`; default is `true`. |

### Local Docker/Dev Tooling Variables

These are used by `tools/dev/docker-compose-dev.yaml`, `.env` files, tests, or load/evaluation scripts. They are not all read by the production AI service process.

| Variable | Default/example | Description |
| --- | --- | --- |
| `COMPOSE_PROJECT_NAME` | `wren` | Docker Compose project name. |
| `PLATFORM` | `linux/amd64` | Docker image platform. |
| `WREN_ENGINE_PORT` | `8080` | Legacy engine/toolkit port in dev compose. |
| `WREN_ENGINE_SQL_PORT` | `7432` | Legacy SQL port in dev compose. |
| `WREN_UI_PORT` | `3000` | Wren UI port used by compose and AI service entrypoint checks. |
| `WREN_ENGINE_VERSION`, `WREN_AI_SERVICE_VERSION`, `WREN_UI_VERSION`, `WREN_PRODUCT_VERSION`, `WREN_BOOTSTRAP_VERSION` | varies | Image/version selectors for local compose. |
| `POSTHOG_API_KEY`, `POSTHOG_HOST`, `TELEMETRY_ENABLED`, `USER_UUID` | varies | Telemetry settings passed to the dev UI stack. |
| `DATASET_NAME`, `LLM_PROVIDER`, `GENERATION_MODEL`, `EMBEDDING_MODEL` | None | Load-test/evaluation metadata variables. |
| `bigquery.project-id`, `bigquery.dataset-id`, `bigquery.credentials-key` | None | Local tool/test BigQuery connection values. |
| `postgres.host`, `postgres.port`, `postgres.database`, `postgres.user`, `postgres.password` | None | Local tool/test Postgres connection values. |

## Others

### Pipeline Evaluation

For a comprehensive understanding of how to evaluate the pipelines, please refer to the [evaluation framework](./eval/README.md). This document provides detailed guidelines on the evaluation process, including how to set up and run evaluations, interpret results, and utilize the evaluation metrics effectively. It is a valuable resource for ensuring that the evaluation is conducted accurately and that the results are meaningful.

### Estimate the Speed of the Pipeline(may be outdated)

- to run the load test
  - setup `DATASET_NAME` in `.env.dev`
  - adjust test config if needed
    - adjust user count in `tests/locust/config_users.json`
  - in wren-ai-service folder, run `just up` to start the docker containers
  - in wren-ai-service folder, run `just start` to start the ai service
  - run `just load-test`
  - check reports in /outputs/locust folder, there are 3 files with filename **locust*report*{test_timestamp}**:
    - .json: test report in json format, including info like llm provider, version
    - .html: test report in html format, showing tables and charts
    - .log: test log

## Contributing

Thank you for investing your time in contributing to our project! Please [read this for more information](CONTRIBUTING.md)!
