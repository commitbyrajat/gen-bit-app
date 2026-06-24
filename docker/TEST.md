# Docker Compose Usage and Service Tests

This directory contains a local development stack with:

- PostgreSQL mutual fund and wealth sample database
- PostgreSQL Wren UI metadata database
- Qdrant
- LiteLLM proxy
- MinIO object storage
- Apache Iceberg REST Catalog
- Trino
- A one-time job that creates sample loan and loan-provider Iceberg tables

## Prerequisites

- Docker Desktop or Docker Engine with Docker Compose v2
- Ports `4000`, `5432`, `5433`, `6333`, `6334`, `8080`, `8181`,
  `9000`, and `9001` available

Run commands from the `docker` directory:

```bash
cd docker
```

When running from the repository root instead, add `-f docker/docker-compose.yml`
to each `docker compose` command.

## Start the Stack

Start every service:

```bash
docker compose up -d
```

The first start downloads the images and can take several minutes. The
`loans-data` container is expected to exit with code `0` after creating and
populating the Iceberg tables.

Check container status:

```bash
docker compose ps -a
```

Expected persistent services:

- `wren-wealth-postgres`: healthy
- `wren-ui-metadata-postgres`: healthy
- `wren-qdrant`: running
- `wren-litellm`: running
- `wren-lancedb-minio`: healthy
- `wren-iceberg-rest`: healthy
- `wren-trino`: healthy

Expected one-time services:

- `wren-lancedb-bucket`: exited with code `0`
- `wren-loans-data`: exited with code `0`

## Service Endpoints

| Service | Endpoint | Credentials |
| --- | --- | --- |
| Trino | `http://localhost:8080` | No password |
| Iceberg REST Catalog | `http://localhost:8181` | No password |
| MinIO S3 API | `http://localhost:9000` | `minioadmin` / `minioadmin` |
| MinIO Console | `http://localhost:9001` | `minioadmin` / `minioadmin` |
| Wealth PostgreSQL | `localhost:5432/wealth_demo` | `wren` / `wren123` |
| Wren metadata PostgreSQL | `localhost:5433/wren_ui_metadata` | `wren` / `wren123` |
| Qdrant HTTP API | `http://localhost:6333` | No password |
| LiteLLM proxy | `http://localhost:4000` | Per-model `CLIENT_*` keys |

## Connect to Trino with JDBC

Use the official Trino JDBC driver:

```text
Driver class: io.trino.jdbc.TrinoDriver
JDBC URL: jdbc:trino://localhost:8080/iceberg/lending
User: wren
Password: leave empty
SSL: disabled
```

The JDBC URL selects:

- Catalog: `iceberg`
- Schema: `lending`

For tools that configure these values separately:

```text
Host: localhost
Port: 8080
Database or catalog: iceberg
Schema: lending
Authentication: none
User: wren
Password: empty
```

Some JDBC clients require a non-empty user even when authentication is
disabled. The user is sent to Trino as the query identity, so use `wren`.

Test the connection with:

```sql
SELECT current_user;
SELECT current_catalog, current_schema;
SELECT count(*) AS loan_count FROM loans;
```

Expected results:

- `current_user`: `wren`
- `current_catalog`: `iceberg`
- `current_schema`: `lending`
- `loan_count`: `12`

Fully qualified table names also work:

```sql
SELECT *
FROM iceberg.lending.loan_providers
ORDER BY provider_id;
```

Minimal Java example:

```java
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.Properties;

Properties properties = new Properties();
properties.setProperty("user", "wren");

try (
    Connection connection = DriverManager.getConnection(
        "jdbc:trino://localhost:8080/iceberg/lending",
        properties
    );
    Statement statement = connection.createStatement();
    ResultSet result = statement.executeQuery(
        "SELECT count(*) FROM loans"
    )
) {
    result.next();
    System.out.println("Loan count: " + result.getLong(1));
}
```

Use a Trino JDBC driver version compatible with the running Trino version
(`481` in `docker-compose.yml`).

## Test Trino and Iceberg

List the Iceberg schemas:

```bash
docker compose exec trino trino \
  --execute "SHOW SCHEMAS FROM iceberg"
```

List all lending tables:

```bash
docker compose exec trino trino \
  --execute "SHOW TABLES FROM iceberg.lending"
```

Expected tables:

- `borrowers`
- `loan_providers`
- `provider_branches`
- `loan_products`
- `loans`
- `loan_provider_assignments`
- `repayments`

Check the seeded row counts:

```bash
docker compose exec trino trino \
  --output-format ALIGNED \
  --execute "
SELECT
  (SELECT count(*) FROM iceberg.lending.borrowers) AS borrowers,
  (SELECT count(*) FROM iceberg.lending.loan_providers) AS providers,
  (SELECT count(*) FROM iceberg.lending.provider_branches) AS branches,
  (SELECT count(*) FROM iceberg.lending.loan_products) AS products,
  (SELECT count(*) FROM iceberg.lending.loans) AS loans,
  (SELECT count(*) FROM iceberg.lending.loan_provider_assignments) AS assignments,
  (SELECT count(*) FROM iceberg.lending.repayments) AS repayments
"
```

Expected counts:

| borrowers | providers | branches | products | loans | assignments | repayments |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 10 | 5 | 10 | 9 | 12 | 12 | 18 |

Query the loan portfolio by provider:

```bash
docker compose exec trino trino \
  --output-format ALIGNED \
  --execute "
SELECT
  p.provider_name,
  count(*) AS loan_count,
  CAST(sum(l.principal_amount) AS DECIMAL(16, 2)) AS portfolio_value
FROM iceberg.lending.loan_providers p
JOIN iceberg.lending.loan_provider_assignments a
  ON a.provider_id = p.provider_id
JOIN iceberg.lending.loans l
  ON l.loan_id = a.loan_id
GROUP BY p.provider_name
ORDER BY portfolio_value DESC
"
```

Test provider mapping integrity:

```bash
docker compose exec trino trino \
  --execute "
SELECT count(*) AS invalid_assignments
FROM iceberg.lending.loan_provider_assignments a
LEFT JOIN iceberg.lending.loan_providers p
  ON p.provider_id = a.provider_id
LEFT JOIN iceberg.lending.provider_branches b
  ON b.branch_code = a.branch_code
 AND b.provider_id = a.provider_id
LEFT JOIN iceberg.lending.loan_products pr
  ON pr.product_id = a.product_id
 AND pr.provider_id = a.provider_id
WHERE p.provider_id IS NULL
   OR b.branch_code IS NULL
   OR pr.product_id IS NULL
"
```

The expected result is `0`.

## Curl Smoke Tests

These commands test every network service exposed by Docker Compose.

### Trino

Submit a SQL query:

```bash
curl -fsS \
  -X POST \
  -H "X-Trino-User: wren" \
  -H "X-Trino-Catalog: iceberg" \
  -H "X-Trino-Schema: lending" \
  --data "SELECT count(*) AS loan_count FROM loans" \
  http://localhost:8080/v1/statement
```

Trino returns a JSON query response. If it contains a `nextUri`, request that
URL to retrieve the next result page:

```bash
curl -fsS "NEXT_URI_FROM_THE_PREVIOUS_RESPONSE"
```

### Iceberg REST Catalog

```bash
curl -fsS http://localhost:8181/v1/config
curl -fsS \
  -H "Content-Type: application/json" \
  http://localhost:8181/v1/namespaces
curl -fsS \
  -H "Content-Type: application/json" \
  http://localhost:8181/v1/namespaces/lending/tables
```

The namespace response should include `lending`, and the tables response
should include the seeded lending tables.

### MinIO

Test the S3 API health endpoints:

```bash
curl -fsS http://localhost:9000/minio/health/live
curl -fsS http://localhost:9000/minio/health/ready
```

Test that the browser console responds:

```bash
curl -fsSI http://localhost:9001/ | head -n 1
```

The expected status is `HTTP/1.1 200 OK`.

### Qdrant

```bash
curl -fsS http://localhost:6333/healthz
curl -fsS http://localhost:6333/collections
```

The collections request should return JSON.

### LiteLLM Proxy

The proxy exposes OpenAI-compatible endpoints on `http://localhost:4000`.
Set `OPENAI_API_KEY` to a real OpenAI key before starting the stack. The
`CLIENT_*` keys below are client-facing proxy keys and are the values to use
when onboarding tenant models.

Chat completion with the first LLM alias:

```bash
curl -fsS http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer ${CLIENT_LLM_GEMINI_FLASH_API_KEY:-sk-client-gemini-flash}" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-2.5-flash",
    "messages": [
      {
        "role": "user",
        "content": "Reply with one short sentence about loan risk."
      }
    ],
    "temperature": 0
  }'
```

Chat completion with the second LLM alias:

```bash
curl -fsS http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer ${CLIENT_LLM_GEMINI_FLASH_TEST_API_KEY:-sk-client-gemini-flash-test}" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-2.5-flash-test",
    "messages": [
      {
        "role": "user",
        "content": "Return only the word ok."
      }
    ],
    "temperature": 0
  }'
```

Embedding with the first embedder alias:

```bash
curl -fsS http://localhost:4000/v1/embeddings \
  -H "Authorization: Bearer ${CLIENT_EMBED_BGE_M3_API_KEY:-sk-client-bge-m3}" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "BAAI/bge-m3",
    "input": "Borrower income, credit score, and repayment history"
  }'
```

Embedding with the second embedder alias:

```bash
curl -fsS http://localhost:4000/v1/embeddings \
  -H "Authorization: Bearer ${CLIENT_EMBED_BGE_M3_TEST_API_KEY:-sk-client-bge-m3-test}" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "BAAI/bge-m3-test",
    "input": [
      "Home loan with active repayment",
      "Personal loan with overdue installment"
    ]
  }'
```

Verify per-model key isolation. This should return an authorization error
because the LLM key is not allowed to access the embedder model:

```bash
curl -i http://localhost:4000/v1/embeddings \
  -H "Authorization: Bearer ${CLIENT_LLM_GEMINI_FLASH_API_KEY:-sk-client-gemini-flash}" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "BAAI/bge-m3",
    "input": "This request should be rejected"
  }'
```

### Wealth PostgreSQL

PostgreSQL is not an HTTP service. Curl can still test that its TCP port
accepts connections:

```bash
curl -v --max-time 2 telnet://localhost:5432 </dev/null
```

Use `psql` for an application-level test:

```bash
docker compose exec postgres psql \
  -U wren \
  -d wealth_demo \
  -c "SELECT count(*) AS mutual_fund_count FROM mutual_funds;"
```

The expected mutual fund count is `8`.

### Wren Metadata PostgreSQL

Test TCP connectivity:

```bash
curl -v --max-time 2 telnet://localhost:5433 </dev/null
```

Use `psql` for an application-level test:

```bash
docker compose exec wren-ui-metadata-postgres psql \
  -U wren \
  -d wren_ui_metadata \
  -c "SELECT current_database(), current_user;"
```

The `lancedb-bucket` and `loans-data` services are one-time initialization
jobs and do not expose network endpoints. Test them with:

```bash
docker compose ps -a lancedb-bucket loans-data
docker compose logs lancedb-bucket loans-data
```

## Test MinIO

Open `http://localhost:9001` and sign in with:

```text
Username: minioadmin
Password: minioadmin
```

Confirm that these buckets exist:

- `wren-lancedb`
- `wren-iceberg`

The `wren-iceberg` bucket should contain the `lending` warehouse data after
the seed job completes.

The buckets can also be listed from the MinIO client container:

```bash
docker compose run --rm --entrypoint /bin/sh lancedb-bucket -c "
mc alias set local http://minio:9000 minioadmin minioadmin &&
mc ls local
"
```

## Test the Iceberg REST Catalog

Check that its configuration endpoint responds:

```bash
curl -fsS http://localhost:8181/v1/config
```

List namespaces:

```bash
curl -fsS \
  -H "Content-Type: application/json" \
  "http://localhost:8181/v1/namespaces"
```

The response should include the `lending` namespace.

## Test PostgreSQL

Check the mutual fund and wealth sample data:

```bash
docker compose exec postgres psql \
  -U wren \
  -d wealth_demo \
  -c "SELECT
        (SELECT count(*) FROM wealth_advisors) AS advisors,
        (SELECT count(*) FROM wealth_clients) AS clients,
        (SELECT count(*) FROM fund_houses) AS fund_houses,
        (SELECT count(*) FROM mutual_funds) AS mutual_funds,
        (SELECT count(*) FROM portfolios) AS portfolios,
        (SELECT count(*) FROM mutual_fund_nav) AS nav_rows,
        (SELECT count(*) FROM portfolio_holdings) AS holdings,
        (SELECT count(*) FROM mutual_fund_transactions) AS transactions,
        (SELECT count(*) FROM financial_goals) AS goals;"
```

Expected counts are `4`, `8`, `4`, `8`, `8`, `16`, `17`, `12`, and `8`
respectively.

Test the relationships and calculate each portfolio's current value:

```bash
docker compose exec postgres psql \
  -U wren \
  -d wealth_demo \
  -c "SELECT
        wc.client_name,
        p.portfolio_name,
        round(sum(ph.current_value), 2) AS current_value
      FROM wealth_clients AS wc
      JOIN portfolios AS p ON p.client_id = wc.client_id
      JOIN portfolio_holdings AS ph ON ph.portfolio_id = p.portfolio_id
      GROUP BY wc.client_name, p.portfolio_name
      ORDER BY current_value DESC;"
```

Check database readiness:

```bash
docker compose exec postgres pg_isready -U wren -d wealth_demo
docker compose exec wren-ui-metadata-postgres \
  pg_isready -U wren -d wren_ui_metadata
```

## Test Qdrant

```bash
curl -fsS http://localhost:6333/healthz
```

A successful response confirms that Qdrant is reachable.

## Reseed the Loan Data

The seed script is idempotent: it drops and recreates the lending tables.
Rerun it after modifying `trino/init/01_loans.sql`:

```bash
docker compose run --rm loans-data
```

Check the seed output:

```bash
docker compose logs loans-data
```

Successful output includes `CREATE TABLE: ... rows` statements without an
error.

## View Logs

```bash
docker compose logs --tail=100 trino
docker compose logs --tail=100 iceberg-rest
docker compose logs --tail=100 minio
docker compose logs --tail=100 loans-data
```

Follow logs continuously:

```bash
docker compose logs -f trino iceberg-rest minio
```

## Stop and Reset

Stop containers while preserving data:

```bash
docker compose down
```

Stop containers and permanently remove all Compose volumes:

```bash
docker compose down -v
```

Removing volumes deletes PostgreSQL data, MinIO objects, and Iceberg catalog
metadata. The next `docker compose up -d` creates a fresh environment.

## Troubleshooting

If a service is unhealthy, inspect its status and logs:

```bash
docker compose ps -a
docker compose logs --tail=200 SERVICE_NAME
```

If a host port is already in use, stop the conflicting process or change the
host-side port in `docker-compose.yml`.

If Trino cannot find the `iceberg` catalog, verify that
`trino/catalog/iceberg.properties` is mounted and restart Trino:

```bash
docker compose restart trino
```

If the lending tables are missing, confirm that Trino and the Iceberg REST
Catalog are healthy, then rerun:

```bash
docker compose run --rm loans-data
```
