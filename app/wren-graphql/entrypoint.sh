#!/bin/bash
set -e

echo "wren-graphql endpoint environment:"
echo "  PORT=${PORT:-3001}"
echo "  HOSTNAME=${HOSTNAME:-0.0.0.0}"
echo "  WREN_ENGINE_ENDPOINT=${WREN_ENGINE_ENDPOINT:-http://localhost:8080}"
echo "  WREN_TOOLKIT_ENDPOINT=${WREN_TOOLKIT_ENDPOINT:-${WREN_ENGINE_ENDPOINT:-http://localhost:8080}}"
echo "  WREN_AI_ENDPOINT=${WREN_AI_ENDPOINT:-http://localhost:5556}"
echo "  DB_TYPE=${DB_TYPE:-sqlite}"
if [[ "${DB_TYPE}" == "pg" ]]; then
  echo "  PG_URL=${PG_URL:-}"
else
  echo "  SQLITE_FILE=${SQLITE_FILE:-./db.sqlite3}"
fi
echo "  SKIP_DEPENDENCY_CHECK=${SKIP_DEPENDENCY_CHECK:-false}"
echo "  DEPENDENCY_CHECK_TIMEOUT_SECONDS=${DEPENDENCY_CHECK_TIMEOUT_SECONDS:-60}"
echo "  DEPENDENCY_CHECK_INTERVAL_SECONDS=${DEPENDENCY_CHECK_INTERVAL_SECONDS:-1}"
echo "  DEPENDENCY_CHECK_HTTP_TIMEOUT_MS=${DEPENDENCY_CHECK_HTTP_TIMEOUT_MS:-3000}"
echo "  DEPENDENCY_CHECK_DB_TIMEOUT_MS=${DEPENDENCY_CHECK_DB_TIMEOUT_MS:-3000}"

if [[ "${SKIP_DEPENDENCY_CHECK}" == "true" ]]; then
  echo "Skipping dependency checks."
else
  node <<'NODE'
const axios = require('axios');
const { Client } = require('pg');

const intervalMs = Number(process.env.DEPENDENCY_CHECK_INTERVAL_SECONDS || 1) * 1000;
const timeoutMs = Number(process.env.DEPENDENCY_CHECK_TIMEOUT_SECONDS || 60) * 1000;
const startedAt = Date.now();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const normalizeEndpoint = (endpoint) => endpoint ? endpoint.replace(/\/+$/, '') : endpoint;

const httpChecks = [
  {
    name: 'wren-engine',
    endpoint: normalizeEndpoint(process.env.WREN_ENGINE_ENDPOINT || 'http://localhost:8080'),
  },
  {
    name: 'wren-ai-service',
    endpoint: normalizeEndpoint(process.env.WREN_AI_ENDPOINT || 'http://localhost:5556'),
  },
];

const toolkitEndpoint = normalizeEndpoint(
  process.env.WREN_TOOLKIT_ENDPOINT || process.env.WREN_ENGINE_ENDPOINT || 'http://localhost:8080',
);
if (toolkitEndpoint && !httpChecks.some((check) => check.endpoint === toolkitEndpoint)) {
  httpChecks.push({ name: 'wren-toolkit', endpoint: toolkitEndpoint });
}

const checkHttp = async ({ name, endpoint }) => {
  await axios.get(endpoint, {
    timeout: Number(process.env.DEPENDENCY_CHECK_HTTP_TIMEOUT_MS || 3000),
    validateStatus: () => true,
  });
  console.log(`${name} is reachable at ${endpoint}`);
};

const checkPostgres = async () => {
  if (process.env.DB_TYPE !== 'pg') return;
  if (!process.env.PG_URL) {
    throw new Error('PG_URL is required when DB_TYPE=pg');
  }

  const client = new Client({
    connectionString: process.env.PG_URL,
    connectionTimeoutMillis: Number(process.env.DEPENDENCY_CHECK_DB_TIMEOUT_MS || 3000),
  });

  try {
    await client.connect();
    await client.query('select 1');
    console.log('postgres is reachable');
  } finally {
    await client.end().catch(() => undefined);
  }
};

const checkAll = async () => {
  await checkPostgres();
  for (const check of httpChecks) {
    await checkHttp(check);
  }
};

(async () => {
  let lastError;

  while (Date.now() - startedAt < timeoutMs) {
    try {
      await checkAll();
      process.exit(0);
    } catch (error) {
      lastError = error;
      console.log(`Waiting for dependencies: ${error.message}`);
      await sleep(intervalMs);
    }
  }

  console.error(`Timeout: dependencies were not ready within ${timeoutMs / 1000} seconds`);
  if (lastError) {
    console.error(lastError.stack || lastError.message);
  }
  process.exit(1);
})();
NODE
fi

if [[ "${DB_TYPE}" != "pg" ]]; then
  SQLITE_PATH="${SQLITE_FILE:-./db.sqlite3}"
  mkdir -p "$(dirname "${SQLITE_PATH}")"
fi

echo "Running database migrations..."
yarn knex migrate:latest

echo "Starting wren-graphql..."
exec node server.js
