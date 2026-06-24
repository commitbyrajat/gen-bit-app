#!/bin/sh
set -eu

TRINO_SERVER="${TRINO_SERVER:-http://trino:8080}"

if trino --server "$TRINO_SERVER" --output-format=TSV --execute "SHOW SCHEMAS FROM iceberg LIKE 'lending'" | grep -q "lending"; then
  trino --server "$TRINO_SERVER" --execute "DROP SCHEMA iceberg.lending CASCADE"
fi

trino --server "$TRINO_SERVER" --file /seed/01_loans.sql
