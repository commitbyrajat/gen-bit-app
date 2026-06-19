# wren-graphql

`wren-graphql` hosts the backend API layer that was previously embedded in `app/wren-ui`.
It serves `/api/graphql` plus the supporting `/api/*` routes used by the UI for auth, admin, streaming, config, and public v1 APIs.

## Environment Variables

Core runtime:

- `PORT`: HTTP port for the service. Defaults to `3001` in this package.
- `NODE_ENV`: Set to `production` for production deployments.
- `WREN_UI_INTERNAL_API_TOKEN`: Optional token accepted through `x-wren-ui-internal-api-token` or `Authorization: Bearer ...` for internal service calls.
- `SKIP_DEPENDENCY_CHECK`: Set to `true` to skip container startup dependency checks.
- `DEPENDENCY_CHECK_TIMEOUT_SECONDS`: Maximum wait time for dependent services. Defaults to `60`.
- `DEPENDENCY_CHECK_INTERVAL_SECONDS`: Retry interval while waiting for dependent services. Defaults to `1`.
- `DEPENDENCY_CHECK_HTTP_TIMEOUT_MS`: Per-request HTTP timeout for Wren Engine, Toolkit, and AI service checks. Defaults to `3000`.
- `DEPENDENCY_CHECK_DB_TIMEOUT_MS`: Postgres connection timeout for startup checks. Defaults to `3000`.

Database:

- `DB_TYPE`: `sqlite` or `pg`. Defaults to `sqlite`.
- `SQLITE_FILE`: SQLite database path. Defaults to `./db.sqlite3`.
- `PG_URL`: Postgres connection string when `DB_TYPE=pg`.
- `DEBUG`: Set to `true` to enable Knex debug logging.

External services:

- `WREN_ENGINE_ENDPOINT`: Wren Engine endpoint. Defaults to `http://localhost:8080`.
- `WREN_AI_ENDPOINT`: Wren AI service endpoint. Defaults to `http://localhost:5556`.
- `WREN_TOOLKIT_ENDPOINT`: Toolkit connector API endpoint. Falls back to `WREN_ENGINE_ENDPOINT`.
- `OTHER_SERVICE_USING_DOCKER`: Set to `true` when dependent services are reached through Docker host networking.
- `EXPERIMENTAL_ENGINE_RUST_VERSION`: Set to `true` to use the Rust toolkit/engine integration path.
- `GENERATION_MODEL`: Optional generation model override passed to AI-related flows.

Storage and encryption:

- `PERSIST_CREDENTIAL_DIR`: Directory for persisted credential files. Defaults to `<cwd>/.tmp`.
- `ENCRYPTION_PASSWORD`: Credential encryption password. Defaults to `sementic`.
- `ENCRYPTION_SALT`: Credential encryption salt. Defaults to `layer`.

Telemetry and versions:

- `TELEMETRY_ENABLED`: Set to `true` to enable telemetry.
- `POSTHOG_API_KEY`: PostHog API key.
- `POSTHOG_HOST`: PostHog host.
- `USER_UUID`: User identifier for telemetry.
- `WREN_UI_VERSION`, `WREN_ENGINE_VERSION`, `WREN_AI_SERVICE_VERSION`, `WREN_PRODUCT_VERSION`: Optional version metadata.

Recommendation tuning:

- `PROJECT_RECOMMENDATION_QUESTION_MAX_CATEGORIES`
- `PROJECT_RECOMMENDATION_QUESTIONS_MAX_QUESTIONS`
- `THREAD_RECOMMENDATION_QUESTION_MAX_CATEGORIES`
- `THREAD_RECOMMENDATION_QUESTIONS_MAX_QUESTIONS`

## Start Locally

Use Node 18 and Yarn 4.5.3.

```bash
cd app/wren-graphql
yarn
yarn migrate
yarn dev
```

The service listens on `http://localhost:3001` by default. GraphQL is available at:

```text
http://localhost:3001/api/graphql
```

For Postgres:

```bash
export DB_TYPE=pg
export PG_URL=postgres://user:password@localhost:5432/dbname
yarn migrate
yarn dev
```

## Production Startup

Build and start the service:

```bash
cd app/wren-graphql
yarn build
yarn migrate
PORT=3001 yarn start
```

The Docker image runs migrations before starting the Next standalone server:

```bash
docker build -t wren-graphql app/wren-graphql
docker run --rm -p 3001:3001 --env-file .env wren-graphql
```

The container entrypoint waits for Postgres when `DB_TYPE=pg`, then checks `WREN_ENGINE_ENDPOINT`, `WREN_TOOLKIT_ENDPOINT`, and `WREN_AI_ENDPOINT` before running migrations and starting the service.

## Connect `wren-ui`

Run `wren-ui` separately and point it at this backend:

```bash
cd app/wren-ui
export WREN_GRAPHQL_ENDPOINT=http://localhost:3001
yarn dev
```

`wren-ui` proxies browser `/api/*` requests to `WREN_GRAPHQL_ENDPOINT`, so auth cookies and streaming endpoints stay same-origin from the browser perspective.
