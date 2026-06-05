## Wren Toolkit Engine

- Path: `toolkit/core/wren`
- HTTP API: `wren-http`
- Local install: `just install-http`
- Local run: `just dev-http`
- Default endpoint: `http://localhost:8000`

The toolkit engine is the supported Wren engine path in this repository. It uses
`wren-core-py`/Apache DataFusion for semantic planning and exposes the
`/v2/connector/*` and `/v3/connector/*` compatibility routes used by the Wren UI
and AI service.

## AI Service

- Path: `app/wren-ai-service`
- Install: `just init`
- Run: `just start`

## UI

- Path: `app/wren-ui`
- Configure `WREN_TOOLKIT_ENDPOINT=http://localhost:8000`
- Configure `WREN_AI_ENDPOINT=http://localhost:5556`
- ``` env DB_TYPE=pg PG_URL=postgres://wren:wren123@localhost:5433/wren_ui_metadata  yarn migrate ```
- ``` env DB_TYPE=pg PG_URL=postgres://wren:wren123@localhost:5433/wren_ui_metadata OTHER_SERVICE_USING_DOCKER=true EXPERIMENTAL_ENGINE_RUST_VERSION=false PORT=3000 HOSTNAME=0.0.0.0 yarn build ```
- ``` env DB_TYPE=pg PG_URL=postgres://wren:wren123@localhost:5433/wren_ui_metadata OTHER_SERVICE_USING_DOCKER=true EXPERIMENTAL_ENGINE_RUST_VERSION=false PORT=3000 HOSTNAME=0.0.0.0 yarn start ```