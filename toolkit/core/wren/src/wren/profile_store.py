"""Postgres-backed profile storage for the HTTP compatibility API."""

from __future__ import annotations

import os
from typing import Any

import psycopg
from psycopg.rows import dict_row
from psycopg.types.json import Jsonb

DEFAULT_METADATA_DATABASE_URL = (
    "postgresql://wren:wren123@localhost:5433/wren_ui_metadata"
)
METADATA_DATABASE_URL_ENV = "WREN_TOOLKIT_METADATA_DATABASE_URL"
LEGACY_METADATA_DATABASE_URL_ENV = "WREN_METADATA_DATABASE_URL"


class PostgresProfileStore:
    def __init__(self, database_url: str | None = None):
        self.database_url = database_url or _metadata_database_url()

    def upsert_profile(
        self, profile_id: str, profile: dict[str, Any], *, activate: bool = False
    ) -> None:
        self._ensure_schema()
        datasource = str(profile["datasource"])
        connection_info = {
            key: value for key, value in profile.items() if key != "datasource"
        }
        with self._connect() as conn:
            if activate:
                conn.execute("update toolkit_profiles set active = false")
            conn.execute(
                """
                insert into toolkit_profiles (
                    profile_id,
                    datasource,
                    connection_info,
                    active,
                    created_at,
                    updated_at
                )
                values (%s, %s, %s, %s, now(), now())
                on conflict (profile_id) do update set
                    datasource = excluded.datasource,
                    connection_info = excluded.connection_info,
                    active = case
                        when excluded.active then true
                        else toolkit_profiles.active
                    end,
                    updated_at = now()
                """,
                (profile_id, datasource, Jsonb(connection_info), activate),
            )
            conn.execute(
                """
                update toolkit_profiles
                set active = true
                where profile_id = %s
                  and not exists (
                    select 1 from toolkit_profiles where active = true
                  )
                """,
                (profile_id,),
            )

    def list_profile_ids(self) -> list[str]:
        self._ensure_schema()
        with self._connect() as conn:
            rows = conn.execute(
                "select profile_id from toolkit_profiles order by profile_id"
            ).fetchall()
        return [str(row["profile_id"]) for row in rows]

    def get_profile(self, profile_id: str) -> dict[str, Any] | None:
        self._ensure_schema()
        with self._connect() as conn:
            row = conn.execute(
                """
                select datasource, connection_info
                from toolkit_profiles
                where profile_id = %s
                """,
                (profile_id,),
            ).fetchone()
        if row is None:
            return None
        return {"datasource": row["datasource"], **dict(row["connection_info"])}

    def debug_profile(self, profile_id: str) -> dict[str, Any]:
        self._ensure_schema()
        with self._connect() as conn:
            row = conn.execute(
                """
                select datasource, connection_info, active
                from toolkit_profiles
                where profile_id = %s
                """,
                (profile_id,),
            ).fetchone()
        if row is None:
            return {"error": f"profile '{profile_id}' not found"}
        profile = {"datasource": row["datasource"], **dict(row["connection_info"])}
        return {
            "name": profile_id,
            "active": bool(row["active"]),
            "config": _mask_profile(profile),
        }

    def delete_profile(self, profile_id: str) -> bool:
        self._ensure_schema()
        with self._connect() as conn:
            cursor = conn.execute(
                "delete from toolkit_profiles where profile_id = %s",
                (profile_id,),
            )
            deleted = cursor.rowcount > 0
            conn.execute(
                """
                update toolkit_profiles
                set active = true
                where profile_id = (
                    select profile_id from toolkit_profiles
                    order by updated_at desc
                    limit 1
                )
                  and not exists (
                    select 1 from toolkit_profiles where active = true
                  )
                """
            )
        return deleted

    def _ensure_schema(self) -> None:
        with self._connect() as conn:
            conn.execute(
                """
                create table if not exists toolkit_profiles (
                    profile_id text primary key,
                    datasource text not null,
                    connection_info jsonb not null default '{}'::jsonb,
                    active boolean not null default false,
                    created_at timestamptz not null default now(),
                    updated_at timestamptz not null default now()
                )
                """
            )

    def _connect(self):
        return psycopg.connect(self.database_url, row_factory=dict_row)


def _metadata_database_url() -> str:
    return (
        os.environ.get(METADATA_DATABASE_URL_ENV)
        or os.environ.get(LEGACY_METADATA_DATABASE_URL_ENV)
        or DEFAULT_METADATA_DATABASE_URL
    )


def _mask_profile(profile: dict[str, Any]) -> dict[str, Any]:
    sensitive = {
        "password",
        "credentials",
        "secret",
        "token",
        "private_key",
        "access_key",
        "key_id",
        "client_id",
        "bucket",
        "endpoint",
        "staging_dir",
        "hostname",
        "http_path",
        "role_arn",
    }
    masked = {}
    for key, value in profile.items():
        lower_key = key.lower()
        if lower_key in sensitive or any(item in lower_key for item in sensitive):
            masked[key] = "***"
        else:
            masked[key] = value
    return masked
