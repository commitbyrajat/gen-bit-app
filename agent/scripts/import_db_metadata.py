#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import shutil
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import psycopg
import yaml

from wren.context import _AGENTS_MD_TEMPLATE, build_json, save_target, validate_project
from wren.profile import expand_profile_secrets, get_active_profile
from wren.type_mapping import parse_type


SYSTEM_SCHEMAS = {"information_schema", "pg_catalog"}
IDENTIFIER_RE = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*$")


@dataclass(frozen=True)
class DbObject:
    schema: str
    name: str
    kind: str
    comment: str | None

    @property
    def key(self) -> tuple[str, str]:
        return self.schema, self.name


def main() -> int:
    parser = argparse.ArgumentParser(
        description=(
            "Import metadata from the active Wren profile's target database "
            "and generate a Wren MDL project."
        )
    )
    parser.add_argument(
        "--output",
        "-o",
        default="db/metadata",
        help="Output directory for generated Wren project files. Default: db/metadata",
    )
    parser.add_argument(
        "--schema",
        action="append",
        help=(
            "Database schema to import. Repeat to include multiple schemas. "
            "Default: all non-system schemas visible to the active profile."
        ),
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite generated files in the output directory.",
    )
    parser.add_argument(
        "--project-name",
        default=None,
        help="Name to write into wren_project.yml. Default: <profile>_metadata.",
    )
    parser.add_argument(
        "--include-db-views",
        action=argparse.BooleanOptionalAction,
        default=True,
        help=(
            "Include database views/materialized views as Wren models and "
            "also emit simple semantic Wren views over them. Default: true."
        ),
    )
    args = parser.parse_args()

    output_dir = Path(args.output).expanduser()
    profile_name, raw_profile = get_active_profile()
    if not profile_name or not raw_profile:
        print(
            "Error: no active Wren profile found. Run `wren profile add ... --activate` first.",
            file=sys.stderr,
        )
        return 1

    profile = expand_profile_secrets(raw_profile)
    datasource = str(profile.get("datasource") or "")
    if datasource != "postgres":
        print(
            f"Error: this utility currently supports active postgres profiles only; got {datasource!r}.",
            file=sys.stderr,
        )
        return 1

    if output_dir.exists() and any(output_dir.iterdir()) and not args.force:
        print(
            f"Error: output directory is not empty: {output_dir}. Use --force to overwrite.",
            file=sys.stderr,
        )
        return 1

    conninfo = _postgres_conninfo(profile)
    with psycopg.connect(**conninfo) as conn:
        schemas = _resolve_schemas(conn, args.schema)
        db_objects = _load_db_objects(conn, schemas, include_views=args.include_db_views)
        if not db_objects:
            print(
                f"Error: no tables or views found for schemas: {', '.join(schemas)}",
                file=sys.stderr,
            )
            return 1

        model_names = _assign_model_names(db_objects)
        pk_columns = _load_primary_keys(conn, schemas)
        unique_sets = _load_unique_column_sets(conn, schemas)
        columns_by_object = _load_columns(conn, schemas, pk_columns)
        relationships = _load_relationships(conn, schemas, model_names, unique_sets)

    _write_project(
        output_dir=output_dir,
        force=args.force,
        project_name=args.project_name or f"{profile_name}_metadata",
        profile_name=profile_name,
        datasource=datasource,
        db_objects=db_objects,
        model_names=model_names,
        columns_by_object=columns_by_object,
        pk_columns=pk_columns,
        relationships=relationships,
        include_db_views=args.include_db_views,
    )

    errors = validate_project(output_dir)
    hard_errors = [err for err in errors if err.level == "error"]
    if hard_errors:
        print("Generated project has validation errors:", file=sys.stderr)
        for err in hard_errors:
            print(f"  {err}", file=sys.stderr)
        return 1

    target = save_target(build_json(output_dir), output_dir)
    model_count = len(db_objects)
    view_count = sum(1 for obj in db_objects if obj.kind in {"VIEW", "MATERIALIZED VIEW"})
    print(f"Imported {model_count} models, {view_count} views, {len(relationships)} relationships.")
    print(f"Wrote Wren project: {output_dir}")
    print(f"Built MDL: {target}")
    return 0


def _postgres_conninfo(profile: dict[str, Any]) -> dict[str, Any]:
    allowed = {
        "host",
        "port",
        "database",
        "user",
        "password",
        "sslmode",
        "connect_timeout",
        "application_name",
    }
    conninfo = {key: profile[key] for key in allowed if key in profile}
    if "database" in conninfo:
        conninfo["dbname"] = conninfo.pop("database")
    kwargs = profile.get("kwargs")
    if isinstance(kwargs, dict):
        conninfo.update(kwargs)
    return conninfo


def _resolve_schemas(conn: psycopg.Connection, requested: list[str] | None) -> list[str]:
    if requested:
        return sorted(dict.fromkeys(requested))

    rows = conn.execute(
        """
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name <> ALL(%s)
          AND schema_name NOT LIKE 'pg_toast%%'
          AND schema_name NOT LIKE 'pg_temp%%'
        ORDER BY schema_name
        """,
        (list(SYSTEM_SCHEMAS),),
    ).fetchall()
    return [row[0] for row in rows]


def _load_db_objects(
    conn: psycopg.Connection,
    schemas: list[str],
    *,
    include_views: bool,
) -> list[DbObject]:
    kinds = ["BASE TABLE"]
    if include_views:
        kinds.extend(["VIEW", "MATERIALIZED VIEW"])

    rows = conn.execute(
        """
        WITH ordinary_objects AS (
            SELECT
                n.nspname AS table_schema,
                c.relname AS table_name,
                CASE c.relkind
                    WHEN 'r' THEN 'BASE TABLE'
                    WHEN 'v' THEN 'VIEW'
                    WHEN 'm' THEN 'MATERIALIZED VIEW'
                END AS table_type,
                obj_description(c.oid, 'pg_class') AS table_comment
            FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = ANY(%s)
              AND c.relkind IN ('r', 'v', 'm')
        )
        SELECT table_schema, table_name, table_type, table_comment
        FROM ordinary_objects
        WHERE table_type = ANY(%s)
        ORDER BY table_schema, table_name
        """,
        (schemas, kinds),
    ).fetchall()
    return [DbObject(*row) for row in rows]


def _load_columns(
    conn: psycopg.Connection,
    schemas: list[str],
    pk_columns: dict[tuple[str, str], list[str]],
) -> dict[tuple[str, str], list[dict[str, Any]]]:
    rows = conn.execute(
        """
        SELECT
            ns.nspname AS table_schema,
            cls.relname AS table_name,
            attr.attname AS column_name,
            pg_catalog.format_type(attr.atttypid, attr.atttypmod) AS raw_type,
            NOT attr.attnotnull AS is_nullable,
            col_description(cls.oid, attr.attnum) AS column_comment,
            attr.attnum AS ordinal_position
        FROM pg_attribute attr
        JOIN pg_class cls ON cls.oid = attr.attrelid
        JOIN pg_namespace ns ON ns.oid = cls.relnamespace
        WHERE ns.nspname = ANY(%s)
          AND cls.relkind IN ('r', 'v', 'm')
          AND attr.attnum > 0
          AND NOT attr.attisdropped
        ORDER BY ns.nspname, cls.relname, attr.attnum
        """,
        (schemas,),
    ).fetchall()

    columns: dict[tuple[str, str], list[dict[str, Any]]] = {}
    for schema, table, name, raw_type, is_nullable, comment, _ordinal in rows:
        key = (schema, table)
        pk_for_table = set(pk_columns.get(key, []))
        column: dict[str, Any] = {
            "name": name,
            "type": parse_type(raw_type, "postgres"),
            "is_calculated": False,
            "not_null": not bool(is_nullable),
            "is_primary_key": name in pk_for_table,
            "properties": {},
        }
        if comment:
            column["properties"]["description"] = comment
        columns.setdefault(key, []).append(column)
    return columns


def _load_primary_keys(
    conn: psycopg.Connection,
    schemas: list[str],
) -> dict[tuple[str, str], list[str]]:
    rows = conn.execute(
        """
        SELECT
            ns.nspname AS table_schema,
            cls.relname AS table_name,
            attr.attname AS column_name,
            keys.ordinality
        FROM pg_constraint con
        JOIN pg_class cls ON cls.oid = con.conrelid
        JOIN pg_namespace ns ON ns.oid = cls.relnamespace
        JOIN unnest(con.conkey) WITH ORDINALITY AS keys(attnum, ordinality) ON true
        JOIN pg_attribute attr ON attr.attrelid = cls.oid AND attr.attnum = keys.attnum
        WHERE con.contype = 'p'
          AND ns.nspname = ANY(%s)
        ORDER BY ns.nspname, cls.relname, keys.ordinality
        """,
        (schemas,),
    ).fetchall()

    pks: dict[tuple[str, str], list[str]] = {}
    for schema, table, column, _ordinal in rows:
        pks.setdefault((schema, table), []).append(column)
    return pks


def _load_unique_column_sets(
    conn: psycopg.Connection,
    schemas: list[str],
) -> dict[tuple[str, str], set[tuple[str, ...]]]:
    rows = conn.execute(
        """
        SELECT
            ns.nspname AS table_schema,
            cls.relname AS table_name,
            con.conname,
            attr.attname AS column_name,
            keys.ordinality
        FROM pg_constraint con
        JOIN pg_class cls ON cls.oid = con.conrelid
        JOIN pg_namespace ns ON ns.oid = cls.relnamespace
        JOIN unnest(con.conkey) WITH ORDINALITY AS keys(attnum, ordinality) ON true
        JOIN pg_attribute attr ON attr.attrelid = cls.oid AND attr.attnum = keys.attnum
        WHERE con.contype IN ('p', 'u')
          AND ns.nspname = ANY(%s)
        ORDER BY ns.nspname, cls.relname, con.conname, keys.ordinality
        """,
        (schemas,),
    ).fetchall()

    grouped: dict[tuple[str, str, str], list[str]] = {}
    for schema, table, constraint, column, _ordinal in rows:
        grouped.setdefault((schema, table, constraint), []).append(column)

    unique_sets: dict[tuple[str, str], set[tuple[str, ...]]] = {}
    for (schema, table, _constraint), columns in grouped.items():
        unique_sets.setdefault((schema, table), set()).add(tuple(columns))
    return unique_sets


def _load_relationships(
    conn: psycopg.Connection,
    schemas: list[str],
    model_names: dict[tuple[str, str], str],
    unique_sets: dict[tuple[str, str], set[tuple[str, ...]]],
) -> list[dict[str, Any]]:
    rows = conn.execute(
        """
        SELECT
            con.conname,
            child_ns.nspname AS child_schema,
            child_cls.relname AS child_table,
            child_attr.attname AS child_column,
            parent_ns.nspname AS parent_schema,
            parent_cls.relname AS parent_table,
            parent_attr.attname AS parent_column,
            keys.ordinality
        FROM pg_constraint con
        JOIN pg_class child_cls ON child_cls.oid = con.conrelid
        JOIN pg_namespace child_ns ON child_ns.oid = child_cls.relnamespace
        JOIN pg_class parent_cls ON parent_cls.oid = con.confrelid
        JOIN pg_namespace parent_ns ON parent_ns.oid = parent_cls.relnamespace
        JOIN unnest(con.conkey, con.confkey) WITH ORDINALITY
            AS keys(child_attnum, parent_attnum, ordinality) ON true
        JOIN pg_attribute child_attr
            ON child_attr.attrelid = child_cls.oid
           AND child_attr.attnum = keys.child_attnum
        JOIN pg_attribute parent_attr
            ON parent_attr.attrelid = parent_cls.oid
           AND parent_attr.attnum = keys.parent_attnum
        WHERE con.contype = 'f'
          AND child_ns.nspname = ANY(%s)
          AND parent_ns.nspname = ANY(%s)
        ORDER BY con.conname, keys.ordinality
        """,
        (schemas, schemas),
    ).fetchall()

    grouped: dict[tuple[str, str, str, str, str], list[tuple[str, str]]] = {}
    for constraint, child_schema, child_table, child_col, parent_schema, parent_table, parent_col, _ordinal in rows:
        key = (constraint, child_schema, child_table, parent_schema, parent_table)
        grouped.setdefault(key, []).append((child_col, parent_col))

    relationships: list[dict[str, Any]] = []
    used_names: set[str] = set()
    for (constraint, child_schema, child_table, parent_schema, parent_table), column_pairs in grouped.items():
        child_key = (child_schema, child_table)
        parent_key = (parent_schema, parent_table)
        if child_key not in model_names or parent_key not in model_names:
            continue
        child_model = model_names[child_key]
        parent_model = model_names[parent_key]
        child_columns = tuple(pair[0] for pair in column_pairs)
        join_type = (
            "ONE_TO_ONE"
            if child_columns in unique_sets.get(child_key, set())
            else "MANY_TO_ONE"
        )
        condition = " AND ".join(
            f"{_quote_identifier(child_model)}.{_quote_identifier(child_col)} = "
            f"{_quote_identifier(parent_model)}.{_quote_identifier(parent_col)}"
            for child_col, parent_col in column_pairs
        )
        base_name = _safe_name(f"{child_model}_{parent_model}")
        rel_name = _dedupe_name(base_name, used_names)
        relationships.append(
            {
                "name": rel_name,
                "models": [child_model, parent_model],
                "join_type": join_type,
                "condition": condition,
                "properties": {"source_constraint": constraint},
            }
        )
    return relationships


def _assign_model_names(db_objects: list[DbObject]) -> dict[tuple[str, str], str]:
    name_counts: dict[str, int] = {}
    for obj in db_objects:
        name_counts[obj.name] = name_counts.get(obj.name, 0) + 1

    used: set[str] = set()
    names: dict[tuple[str, str], str] = {}
    for obj in db_objects:
        raw_name = obj.name if name_counts[obj.name] == 1 else f"{obj.schema}_{obj.name}"
        names[obj.key] = _dedupe_name(_safe_name(raw_name), used)
    return names


def _write_project(
    *,
    output_dir: Path,
    force: bool,
    project_name: str,
    profile_name: str,
    datasource: str,
    db_objects: list[DbObject],
    model_names: dict[tuple[str, str], str],
    columns_by_object: dict[tuple[str, str], list[dict[str, Any]]],
    pk_columns: dict[tuple[str, str], list[str]],
    relationships: list[dict[str, Any]],
    include_db_views: bool,
) -> None:
    if force and output_dir.exists():
        shutil.rmtree(output_dir)

    (output_dir / "models").mkdir(parents=True, exist_ok=True)
    (output_dir / "views").mkdir(parents=True, exist_ok=True)
    (output_dir / "cubes").mkdir(parents=True, exist_ok=True)

    _write_yaml(
        output_dir / "wren_project.yml",
        {
            "schema_version": 3,
            "name": project_name,
            "version": "1.0",
            "catalog": "wren",
            "schema": "public",
            "data_source": datasource,
            "profile": profile_name,
        },
    )

    for obj in db_objects:
        model_name = model_names[obj.key]
        columns = columns_by_object.get(obj.key, [])
        metadata: dict[str, Any] = {
            "name": model_name,
            "table_reference": {
                "catalog": "",
                "schema": obj.schema,
                "table": obj.name,
            },
            "columns": columns,
            "cached": False,
            "properties": {
                "database_schema": obj.schema,
                "database_object": obj.name,
                "database_object_type": obj.kind,
            },
        }
        if obj.comment:
            metadata["properties"]["description"] = obj.comment
        pk = pk_columns.get(obj.key, [])
        if len(pk) == 1:
            metadata["primary_key"] = pk[0]

        model_dir = output_dir / "models" / model_name
        model_dir.mkdir(parents=True, exist_ok=True)
        _write_yaml(model_dir / "metadata.yml", metadata)

        if include_db_views and obj.kind in {"VIEW", "MATERIALIZED VIEW"}:
            view_name = _safe_name(f"{model_name}_view")
            view_dir = output_dir / "views" / view_name
            view_dir.mkdir(parents=True, exist_ok=True)
            _write_yaml(
                view_dir / "metadata.yml",
                {
                    "name": view_name,
                    "properties": {
                        "database_schema": obj.schema,
                        "database_view": obj.name,
                        "database_object_type": obj.kind,
                    },
                },
            )
            select_list = ", ".join(_quote_identifier(c["name"]) for c in columns) or "*"
            _write_yaml(
                view_dir / "sql.yml",
                {"statement": f"SELECT {select_list} FROM {_quote_identifier(model_name)}"},
            )

    _write_yaml(output_dir / "relationships.yml", {"relationships": relationships})
    (output_dir / "instructions.md").write_text(
        "# User Instructions\n\n"
        "Use the generated model names in SQL. Do not query raw database table names directly.\n"
    )
    (output_dir / "AGENTS.md").write_text(_AGENTS_MD_TEMPLATE)
    _write_yaml(output_dir / "queries.yml", {"version": 1, "pairs": []})


def _write_yaml(path: Path, data: dict[str, Any]) -> None:
    path.write_text(yaml.safe_dump(data, default_flow_style=False, sort_keys=False))


def _safe_name(name: str) -> str:
    value = re.sub(r"[^A-Za-z0-9_]+", "_", name.strip())
    value = re.sub(r"_+", "_", value).strip("_").lower()
    if not value:
        value = "object"
    if value[0].isdigit():
        value = f"_{value}"
    return value


def _dedupe_name(base: str, used: set[str]) -> str:
    candidate = base
    index = 2
    while candidate in used:
        candidate = f"{base}_{index}"
        index += 1
    used.add(candidate)
    return candidate


def _quote_identifier(identifier: str) -> str:
    if IDENTIFIER_RE.match(identifier):
        return identifier
    escaped = identifier.replace('"', '""')
    return f'"{escaped}"'


if __name__ == "__main__":
    raise SystemExit(main())
