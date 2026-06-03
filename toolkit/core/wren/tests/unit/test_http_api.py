from __future__ import annotations

import base64

import orjson
import pandas as pd
import pytest
from fastapi.testclient import TestClient

from wren.http_api import create_app

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
    def __init__(self, manifest_str, data_source, connection_info, *args, **kwargs):
        self.manifest_str = manifest_str
        self.data_source = data_source
        self.connection_info = connection_info
        self.sql = None
        self.limit = None

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


@pytest.fixture()
def client(monkeypatch):
    monkeypatch.setattr("wren.http_api.WrenEngine", _FakeEngine)
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
