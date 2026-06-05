from __future__ import annotations

import base64

import orjson
import pandas as pd
import pytest
from fastapi.testclient import TestClient

from wren.http_api import _set_profile_store_for_tests, create_app

pytestmark = pytest.mark.unit

_MANIFEST = {
    "catalog": "wren",
    "schema": "public",
    "models": [
        {
            "name": "orders",
            "tableReference": {"schema": "main", "table": "orders"},
            "columns": [{"name": "id", "type": "integer"}],
            "primaryKey": "id",
        }
    ],
}
_MANIFEST_STR = base64.b64encode(orjson.dumps(_MANIFEST)).decode()


class _FakeTable:
    def to_pandas(self):
        return pd.DataFrame({"id": [1, 2], "name": ["a", "b"]})


class _FakeEngine:
    instances = []

    def __init__(self, manifest_str, data_source, connection_info, *args, **kwargs):
        self.manifest_str = manifest_str
        self.data_source = data_source
        self.connection_info = connection_info
        self.sql = None
        self.limit = None
        self.instances.append(self)

    def __enter__(self):
        return self

    def __exit__(self, *_):
        return None

    def query(self, sql, limit=None):
        self.sql = sql
        self.limit = limit
        return _FakeTable()

    def dry_run(self, sql):
        self.sql = sql

    def dry_plan(self, sql):
        return f"planned: {sql}"


class _MemoryProfileStore:
    def __init__(self):
        self.profiles = {}
        self.active = None

    def upsert_profile(self, profile_id, profile, *, activate=False):
        self.profiles[profile_id] = dict(profile)
        if activate or self.active is None:
            self.active = profile_id

    def list_profile_ids(self):
        return sorted(self.profiles)

    def get_profile(self, profile_id):
        profile = self.profiles.get(profile_id)
        return dict(profile) if profile else None

    def debug_profile(self, profile_id):
        profile = self.profiles.get(profile_id)
        if profile is None:
            return {"error": f"profile '{profile_id}' not found"}
        return {
            "name": profile_id,
            "active": self.active == profile_id,
            "config": dict(profile),
        }

    def delete_profile(self, profile_id):
        return self.profiles.pop(profile_id, None) is not None


class _FakePostgresConnection:
    def __init__(self):
        self.query = ""

    def __enter__(self):
        return self

    def __exit__(self, *_):
        return None

    def execute(self, query):
        self.query = query
        return self

    def fetchall(self):
        if "referential_constraints" in self.query:
            return [
                {
                    "constraint_name": "orders_customer_id_fkey",
                    "constraint_table_schema": "public",
                    "constraint_table": "orders",
                    "constraint_column": "customer_id",
                    "constrained_table_schema": "public",
                    "constrained_table": "customers",
                    "constrained_column": "id",
                }
            ]

        return [
            {
                "table_catalog": "analytics",
                "table_schema": "public",
                "table_name": "orders",
                "column_name": "id",
                "data_type": "integer",
                "is_nullable": "NO",
                "ordinal_position": 1,
                "primary_key": "id",
                "table_comment": "Orders table",
                "column_comment": "Order id",
            },
            {
                "table_catalog": "analytics",
                "table_schema": "public",
                "table_name": "orders",
                "column_name": "amount",
                "data_type": "numeric",
                "is_nullable": "YES",
                "ordinal_position": 2,
                "primary_key": "id",
                "table_comment": "Orders table",
                "column_comment": None,
            },
        ]


@pytest.fixture()
def client(monkeypatch):
    _FakeEngine.instances.clear()
    monkeypatch.setattr("wren.http_api.WrenEngine", _FakeEngine)
    _set_profile_store_for_tests(_MemoryProfileStore())
    return TestClient(create_app())


def test_query_matches_legacy_response_shape(client):
    response = client.post(
        "/v3/connector/postgres/query?limit=10",
        json={
            "sql": 'select id from "orders"',
            "manifestStr": _MANIFEST_STR,
            "connectionInfo": {"connectionUrl": "postgresql://u:p@localhost/db"},
        },
    )

    assert response.status_code == 200
    assert response.headers["x-cache-hit"] == "false"
    assert response.json() == {
        "columns": ["id", "name"],
        "data": [[1, "a"], [2, "b"]],
        "dtypes": {"id": "int64", "name": "object"},
    }


def test_dry_run_returns_204(client):
    response = client.post(
        "/v3/connector/POSTGRES/query?dryRun=true",
        json={
            "sql": 'select id from "orders"',
            "manifestStr": _MANIFEST_STR,
            "connectionInfo": {"connectionUrl": "postgresql://u:p@localhost/db"},
        },
    )

    assert response.status_code == 204


def test_dry_plan_returns_plain_text(client):
    response = client.post(
        "/v3/connector/BIG_QUERY/dry-plan",
        json={"sql": 'select id from "orders"', "manifestStr": _MANIFEST_STR},
    )

    assert response.status_code == 200
    assert response.text == 'planned: select id from "orders"'


def test_ai_service_helper_endpoints(client):
    assert client.get("/v3/connector/postgres/functions").json() == []
    assert client.get("/v3/connector/postgres/knowledge").json() == {}


def test_profile_registration_converts_postgres_url_for_query(client):
    profile_response = client.post(
        "/v1/profiles",
        json={
            "profileId": "project-1",
            "dataSource": "postgres",
            "connectionInfo": {
                "connectionUrl": (
                    "postgresql://u:p%40ss@localhost:5433/analytics"
                    "?sslmode=require"
                )
            },
        },
    )

    assert profile_response.status_code == 200
    assert profile_response.json()["profileId"] == "project-1"

    response = client.post(
        "/v3/connector/postgres/query",
        json={
            "sql": 'select id from "orders"',
            "manifestStr": _MANIFEST_STR,
            "profileId": "project-1",
        },
    )

    assert response.status_code == 200
    assert _FakeEngine.instances[-1].connection_info == {
        "host": "localhost",
        "port": "5433",
        "database": "analytics",
        "user": "u",
        "password": "p@ss",
        "kwargs": {"sslmode": "require"},
    }


def test_postgres_metadata_tables_uses_profile(client, monkeypatch):
    monkeypatch.setattr(
        "wren.http_api._connect_postgres", lambda _connection_info: _FakePostgresConnection()
    )
    client.post(
        "/v1/profiles",
        json={
            "profileId": "project-1",
            "dataSource": "postgres",
            "connectionInfo": {
                "connectionUrl": "postgresql://u:p@localhost:5433/analytics"
            },
        },
    )

    response = client.post(
        "/v2/connector/postgres/metadata/tables",
        json={"profileId": "project-1"},
    )

    assert response.status_code == 200
    assert response.json() == [
        {
            "name": "public.orders",
            "description": "Orders table",
            "columns": [
                {
                    "name": "id",
                    "type": "INTEGER",
                    "notNull": True,
                    "description": "Order id",
                    "properties": None,
                },
                {
                    "name": "amount",
                    "type": "NUMERIC",
                    "notNull": False,
                    "description": None,
                    "properties": None,
                },
            ],
            "properties": {
                "schema": "public",
                "catalog": "analytics",
                "table": "orders",
            },
            "primaryKey": "id",
        }
    ]


def test_postgres_metadata_constraints_uses_profile(client, monkeypatch):
    monkeypatch.setattr(
        "wren.http_api._connect_postgres",
        lambda _connection_info: _FakePostgresConnection(),
    )
    client.post(
        "/v1/profiles",
        json={
            "profileId": "project-1",
            "dataSource": "postgres",
            "connectionInfo": {
                "connectionUrl": "postgresql://u:p@localhost:5433/analytics"
            },
        },
    )

    response = client.post(
        "/v2/connector/postgres/metadata/constraints",
        json={"profileId": "project-1"},
    )

    assert response.status_code == 200
    assert response.json() == [
        {
            "constraintName": "orders_customer_id_fkey",
            "constraintType": "FOREIGN KEY",
            "constraintTable": "public.orders",
            "constraintColumn": "customer_id",
            "constraintedTable": "public.customers",
            "constraintedColumn": "id",
        }
    ]
