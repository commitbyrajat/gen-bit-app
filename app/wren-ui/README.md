# wren-ui

`wren-ui` is the Next.js frontend. It does not own backend API routes, GraphQL resolvers, migrations, or metadata database access. Those live in `app/wren-graphql`.

Browser calls to `/api/*` stay same-origin and are proxied by Next.js to `WREN_GRAPHQL_ENDPOINT`.

## Requirements

- Node.js 18
- Yarn 4.5.3 through Corepack
- A running `app/wren-graphql` service for local development, codegen, and end-to-end tests

```bash
corepack enable
```

## Environment Variables

- `WREN_GRAPHQL_ENDPOINT`: Base URL for `wren-graphql`. Defaults to `http://localhost:3001`.
- `PORT`: UI server port when running the built standalone server. Defaults to `3000`.
- `HOSTNAME`: Bind address for the built standalone server. Use `0.0.0.0` in containers.
- `ANALYZE`: Set to `true` during build to enable the Next bundle analyzer.
- `NODE_ENV`: Usually `development` for `yarn dev` and `production` for built runtime.

Do not configure database or engine variables in `wren-ui`; set them on `wren-graphql`.

## Start Locally

Start the backend first:

```bash
cd ../wren-graphql
yarn
yarn migrate
yarn dev
```

Start the UI:

```bash
cd ../wren-ui
yarn
export WREN_GRAPHQL_ENDPOINT=http://localhost:3001
yarn dev
```

Open `http://localhost:3000`.

## Build And Run

Build the UI:

```bash
yarn build
```

Run the standalone build:

```bash
WREN_GRAPHQL_ENDPOINT=http://localhost:3001 PORT=3000 HOSTNAME=0.0.0.0 yarn start
```

`yarn start` expects `.next/standalone` to exist, so run `yarn build` first.

## Test

Type check:

```bash
yarn check-types
```

Lint:

```bash
yarn lint
```

Unit tests:

```bash
yarn test
```

End-to-end tests:

```bash
cd ../wren-graphql
yarn build

cd ../wren-ui
yarn build
yarn test:e2e
```

The Playwright config starts both built services. It runs `wren-graphql` on `3001`, `wren-ui` on `3000`, and uses the backend-owned E2E database helper.

## Docker

Build the UI image:

```bash
docker build -t wren-ui app/wren-ui
```

Run it with a backend reachable from inside the container:

```bash
docker run --rm \
  -p 3000:3000 \
  -e WREN_GRAPHQL_ENDPOINT=http://host.docker.internal:3001 \
  -e PORT=3000 \
  wren-ui
```

In Docker Compose or Kubernetes, set `WREN_GRAPHQL_ENDPOINT` to the service DNS name, for example `http://wren-graphql:3001`.

## GraphQL Changes

When `app/wren-graphql` adds, updates, or deletes GraphQL schema fields, queries, or mutations, update the UI generated GraphQL types and hooks.

1. Start `wren-graphql`:

```bash
cd ../wren-graphql
yarn dev
```

2. Update UI operation documents as needed:

```text
app/wren-ui/src/apollo/client/graphql/*.ts
```

3. Generate UI GraphQL types and hooks:

```bash
cd ../wren-ui
yarn generate-gql
```

The codegen schema endpoint is configured in `codegen.yaml` and defaults to:

```text
http://localhost:3001/api/graphql
```

If the backend is running elsewhere, update `codegen.yaml` before running codegen.

4. Fix compile errors and update UI usage:

```bash
yarn check-types
```

Typical cases:

- New backend field or mutation: add/update the relevant `.ts` operation document, run codegen, then consume the generated hook/type.
- Backend field rename: update operation documents, run codegen, then fix affected UI code.
- Backend field deletion: remove deleted fields from operation documents and UI code, run codegen, then type check.

Commit both the operation document changes and generated files.
