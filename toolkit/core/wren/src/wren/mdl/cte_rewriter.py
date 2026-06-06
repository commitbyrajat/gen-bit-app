"""CTE-based SQL rewriter.

Parses user SQL with sqlglot, uses ``qualify_columns`` to fully resolve
all column references, then calls wren-core
``transform_sql`` once per model with a simple ``SELECT col1, col2 FROM
model`` and injects each expanded result as a CTE into the original query.
"""

from __future__ import annotations

import base64
import json
import re

import sqlglot
from sqlglot import exp, parse_one
from sqlglot.optimizer.normalize_identifiers import normalize_identifiers
from sqlglot.optimizer.qualify_columns import qualify_columns
from sqlglot.optimizer.qualify_tables import qualify_tables
from sqlglot.optimizer.scope import Scope, traverse_scope
from sqlglot.schema import MappingSchema

# Ensure the Wren dialect is registered with sqlglot on import.
import wren.mdl.wren_dialect as _wren_dialect  # noqa: F401
from wren.model.data_source import DataSource
from wren.policy import resolve_model_name

_SQLGLOT_DIALECT_MAP: dict[DataSource, str] = {
    DataSource.canner: "trino",
    DataSource.datafusion: "wren",
    DataSource.mssql: "tsql",
    DataSource.local_file: "duckdb",
    DataSource.s3_file: "duckdb",
    DataSource.minio_file: "duckdb",
    DataSource.gcs_file: "duckdb",
}
_SIMPLE_IDENTIFIER = re.compile(r"^[A-Za-z_][A-Za-z0-9_$]*$")
_CATEGORICAL_PERIOD = re.compile(r"^\d{4}-(?:H[12]|Q[1-4])$", re.IGNORECASE)
_TEXT_TYPE_PREFIXES = ("CHAR", "STRING", "TEXT", "VARCHAR")
_TIMESTAMP_TYPES = {
    exp.DataType.Type.DATE,
    exp.DataType.Type.DATETIME,
    exp.DataType.Type.TIMESTAMP,
    exp.DataType.Type.TIMESTAMPLTZ,
    exp.DataType.Type.TIMESTAMPTZ,
}
_IDENTIFIER_BOUNDARY_KEYWORDS = (
    "AND",
    "AS",
    "CROSS",
    "FROM",
    "FULL",
    "GROUP",
    "HAVING",
    "INNER",
    "JOIN",
    "LEFT",
    "LIMIT",
    "ON",
    "ORDER",
    "OR",
    "RIGHT",
    "UNION",
    "WHERE",
)


def get_sqlglot_dialect(data_source: DataSource) -> str:
    """Map a DataSource to a valid sqlglot dialect name."""
    return _SQLGLOT_DIALECT_MAP.get(data_source, data_source.name)


def parse_one_with_identifier_quote_repair(
    sql: str, *, dialect: str
) -> tuple[exp.Expression, str]:
    """Parse SQL, retrying once for a common terminal quoted-identifier typo.

    LLM-generated SQL occasionally emits a qualified identifier like
    ``"orders"."id"" = ...``. SQL parsers treat the terminal ``""`` as an
    escaped double quote inside the identifier, leaving it unterminated. If
    the initial parse fails, remove only that extra trailing quote shape and
    retry; all other parse errors keep the original failure behavior.
    """
    try:
        return parse_one(sql, dialect=dialect), sql
    except (sqlglot.errors.ParseError, sqlglot.errors.TokenError):
        repaired = _repair_terminal_doubled_identifier_quotes(sql)
        if repaired == sql:
            raise
        return parse_one(repaired, dialect=dialect), repaired


def _repair_terminal_doubled_identifier_quotes(sql: str) -> str:
    out: list[str] = []
    i = 0
    repaired = False

    while i < len(sql):
        if sql.startswith("--", i):
            end = sql.find("\n", i + 2)
            if end == -1:
                out.append(sql[i:])
                break
            out.append(sql[i : end + 1])
            i = end + 1
            continue

        if sql.startswith("/*", i):
            end = sql.find("*/", i + 2)
            if end == -1:
                out.append(sql[i:])
                break
            out.append(sql[i : end + 2])
            i = end + 2
            continue

        if sql[i] == "'":
            j = i + 1
            while j < len(sql):
                if sql[j] == "'":
                    if j + 1 < len(sql) and sql[j + 1] == "'":
                        j += 2
                        continue
                    j += 1
                    break
                j += 1
            out.append(sql[i:j])
            i = j
            continue

        if sql[i] != '"':
            out.append(sql[i])
            i += 1
            continue

        j = i + 1
        while j < len(sql):
            if sql[j] != '"':
                j += 1
                continue

            if j + 1 < len(sql) and sql[j + 1] == '"':
                candidate = sql[i + 1 : j]
                if _SIMPLE_IDENTIFIER.fullmatch(
                    candidate
                ) and _is_terminal_identifier_boundary(sql, j + 2):
                    out.append(sql[i : j + 1])
                    i = j + 2
                    repaired = True
                    break
                j += 2
                continue

            out.append(sql[i : j + 1])
            i = j + 1
            break
        else:
            out.append(sql[i:])
            break

    return "".join(out) if repaired else sql


def _is_terminal_identifier_boundary(sql: str, pos: int) -> bool:
    while pos < len(sql) and sql[pos].isspace():
        pos += 1
    if pos >= len(sql):
        return True
    if sql[pos] in ",);=<>+-*/":
        return True
    for keyword in _IDENTIFIER_BOUNDARY_KEYWORDS:
        end = pos + len(keyword)
        if sql[pos:end].upper() == keyword and (
            end >= len(sql) or not (sql[end].isalnum() or sql[end] in "_$")
        ):
            return True
    return False


class CTERewriter:
    """Rewrite user SQL by expanding MDL model references into CTEs.

    Parameters
    ----------
    manifest_str:
        Base64-encoded MDL JSON string.
    session_context:
        A ``wren_core.SessionContext`` used to expand per-model SQL.
    data_source:
        The target data source (determines sqlglot dialect).
    fallback:
        When ``True`` (default), if no model references are detected in the
        SQL, fall back to ``session_context.transform_sql()`` directly.
        Set to ``False`` in tests to ensure the CTE path is always exercised
        and silent fallbacks don't mask bugs.
    """

    def __init__(
        self,
        manifest_str: str,
        session_context,
        data_source: DataSource,
        *,
        fallback: bool = True,
    ):
        self.session_context = session_context
        self.data_source = data_source
        self.fallback = fallback
        self.dialect = get_sqlglot_dialect(data_source)
        self.manifest = json.loads(base64.b64decode(manifest_str))

        self.model_dict: dict[str, dict] = {}
        self.schema = MappingSchema(dialect=self.dialect)
        # normalized column name → original manifest column name, per model
        self._col_orig_name: dict[str, dict[str, str]] = {}
        self._column_types: dict[str, dict[str, str]] = {}

        for model in self.manifest.get("models", []):
            name = model["name"]
            self.model_dict[name] = model
            cols: dict[str, str] = {}
            orig: dict[str, str] = {}
            column_types: dict[str, str] = {}
            for col in model.get("columns", []):
                if col.get("isHidden"):
                    continue
                if col.get("relationship"):
                    continue
                col_name = col["name"]
                cols[col_name] = col.get("type", "TEXT")
                orig[col_name.lower()] = col_name
                column_types[col_name.lower()] = col.get("type", "TEXT").upper()
            # ``qualify_columns`` runs against the post-``normalize_identifiers``
            # AST, so the schema must be keyed under the same normalized form
            # of the model name. BigQuery / DuckDB lowercase, Oracle uppercases —
            # registering the literal manifest name leaves a mismatch and the
            # column qualification silently produces an empty CTE body.
            schema_name = normalize_identifiers(
                exp.to_identifier(name, quoted=True), dialect=self.dialect
            ).name
            self.schema.add_table(schema_name, cols, dialect=self.dialect)
            self._col_orig_name[name] = orig
            self._column_types[name] = column_types

    def rewrite(self, sql: str) -> str:
        """Rewrite *sql* by injecting model CTEs.

        Returns the transformed SQL string in the target sqlglot dialect.
        If no model references are found, falls back to
        ``session_context.transform_sql(sql)`` directly (when ``fallback``
        is ``True``); otherwise raises ``ValueError``.
        """
        ast, sql = parse_one_with_identifier_quote_repair(sql, dialect=self.dialect)

        user_cte_names = self._collect_user_cte_names(ast)
        self._repair_undefined_table_aliases(ast)
        self._repair_categorical_period_timestamp_casts(ast, user_cte_names)
        used_columns, user_table_refs = self._collect_model_columns(ast, user_cte_names)

        # No model references detected — either fall back to the legacy
        # whole-query transform, or raise so tests can catch the miss.
        if not used_columns:
            if self.fallback:
                wren_sql = self.session_context.transform_sql(sql)
                return sqlglot.transpile(wren_sql, read="wren", write=self.dialect)[0]
            raise ValueError(f"No model references found in SQL: {sql}")

        model_ctes = self._build_model_ctes(used_columns, user_table_refs)
        self._inject_ctes(ast, model_ctes)
        # Oracle uppercases unquoted identifiers. Without forcing quoting
        # on output, the user's ``SELECT o_orderkey FROM orders`` would
        # land as ``SELECT O_ORDERKEY FROM ORDERS`` — both the table
        # reference and the result column name. The injected CTE projects
        # quoted lowercase columns, so the lookup misses (ORA-00904), and
        # any caller asserting on result-column casing breaks. Forcing
        # quoting on Oracle makes the dialect's output deterministic and
        # matches the pre-fallback path where wren-core's whole-query
        # transform had quoted everything implicitly.
        identify = self.data_source == DataSource.oracle
        return ast.sql(dialect=self.dialect, identify=identify)

    def _repair_undefined_table_aliases(self, ast: exp.Expression) -> None:
        """Repair a uniquely identifiable model alias typo in each SQL scope."""
        for scope in traverse_scope(ast):
            visible_sources = self._visible_scope_sources(scope)
            undefined_columns = [
                column
                for column in scope.external_columns
                if column.table
                and column.table.lower() not in visible_sources
            ]
            for column in undefined_columns:
                candidates: list[str] = []
                qualifier = column.table.lower()
                for source_alias, model_name in self._scope_model_sources(scope).items():
                    column_type = self._column_types.get(model_name, {}).get(
                        column.name.lower()
                    )
                    if column_type is None:
                        continue
                    if qualifier in self._model_alias_candidates(model_name):
                        candidates.append(source_alias)

                if len(candidates) == 1:
                    table_identifier = column.args.get("table")
                    quoted = (
                        bool(table_identifier.quoted)
                        if isinstance(table_identifier, exp.Identifier)
                        else False
                    )
                    column.set(
                        "table",
                        exp.to_identifier(candidates[0], quoted=quoted),
                    )

    @staticmethod
    def _visible_scope_sources(scope: Scope) -> set[str]:
        visible: set[str] = set()
        current: Scope | None = scope
        while current is not None:
            visible.update(source.lower() for source in current.sources)
            current = current.parent
        return visible

    def _scope_model_sources(self, scope: Scope) -> dict[str, str]:
        sources: dict[str, str] = {}
        for source_alias, source in scope.sources.items():
            if not isinstance(source, exp.Table):
                continue
            quoted = (
                bool(source.this.quoted)
                if isinstance(source.this, exp.Identifier)
                else False
            )
            model_name = resolve_model_name(source.name, quoted, self.model_dict)
            if model_name is not None:
                sources[source_alias] = model_name
        return sources

    def _model_alias_candidates(self, model_name: str) -> set[str]:
        model = self.model_dict[model_name]
        table_reference = model.get("tableReference") or model.get(
            "table_reference", {}
        )
        names = {
            model_name,
            table_reference.get("table", ""),
        }
        candidates: set[str] = set()
        for name in names:
            tokens = [token for token in re.split(r"[^A-Za-z0-9]+", name) if token]
            if not tokens:
                continue
            candidates.add(name.lower())
            candidates.add("".join(token[0] for token in tokens).lower())
        return candidates

    def _repair_categorical_period_timestamp_casts(
        self, ast: exp.Expression, user_cte_names: set[str]
    ) -> None:
        """Keep half-year and quarter labels as text when the schema says text."""
        alias_to_model, _ = self._build_alias_map(ast, user_cte_names)
        referenced_models = set(alias_to_model.values())

        for comparison in ast.find_all((exp.EQ, exp.NEQ)):
            left = comparison.this
            right = comparison.expression
            repaired = self._categorical_period_comparison(
                left, right, alias_to_model, referenced_models
            )
            if repaired is None:
                repaired = self._categorical_period_comparison(
                    right, left, alias_to_model, referenced_models
                )
                if repaired is not None:
                    repaired = repaired[1], repaired[0]
            if repaired is not None:
                comparison.set("this", repaired[0])
                comparison.set("expression", repaired[1])

    def _categorical_period_comparison(
        self,
        column_side: exp.Expression,
        literal_side: exp.Expression,
        alias_to_model: dict[str, str],
        referenced_models: set[str],
    ) -> tuple[exp.Expression, exp.Expression] | None:
        if not self._is_timestamp_cast(column_side):
            return None

        column = column_side.this
        if not isinstance(column, exp.Column):
            return None

        literal = (
            literal_side.this
            if self._is_timestamp_cast(literal_side)
            else literal_side
        )
        if not (
            isinstance(literal, exp.Literal)
            and literal.is_string
            and _CATEGORICAL_PERIOD.fullmatch(literal.this)
        ):
            return None

        model_name = alias_to_model.get(column.table)
        if model_name is None and column.table:
            model_name = alias_to_model.get(column.table.lower())
        if model_name is None and not column.table and len(referenced_models) == 1:
            model_name = next(iter(referenced_models))
        if model_name is None:
            return None

        column_type = self._column_types.get(model_name, {}).get(column.name.lower(), "")
        if not column_type.startswith(_TEXT_TYPE_PREFIXES):
            return None

        return column.copy(), literal.copy()

    @staticmethod
    def _is_timestamp_cast(expression: exp.Expression) -> bool:
        if not isinstance(expression, (exp.Cast, exp.TryCast)):
            return False
        data_type = expression.args.get("to")
        return isinstance(data_type, exp.DataType) and data_type.this in _TIMESTAMP_TYPES

    # ------------------------------------------------------------------
    # Column collection via qualify
    # ------------------------------------------------------------------

    def _collect_model_columns(
        self, ast: exp.Expression, user_cte_names: set[str]
    ) -> tuple[dict[str, list[str] | None], dict[str, tuple[str, bool]]]:
        """Return ``(used_columns, user_table_refs)`` for all referenced models.

        ``used_columns``: ``{model_name: [col1, col2, ...]}``. A value of
        ``None`` means the model was referenced via ``SELECT *`` and should
        be passed as-is to ``transform_sql`` so wren-core applies CLAC.

        ``user_table_refs``: ``{model_name: (user_name, user_quoted)}``
        capturing the literal identifier the user wrote (case + quoting)
        for the first occurrence of each model. The CTE alias matches that
        so dialects with case-folding (Oracle uppercases unquoted ⇒ the
        emitted CTE must fold to the same form) bind the user's outer
        reference to the injected CTE.

        Uses sqlglot's ``qualify_columns`` to fully resolve all column
        references (including ``SELECT *`` expansion and correlated
        subquery outer references), then walks the qualified AST to collect
        model→column mappings. Column order follows the manifest definition
        (via insertion order) so ``SELECT *`` preserves schema order.
        """
        copy = ast.copy()
        copy = qualify_tables(copy, dialect=self.dialect)

        # Resolve every table ref to its canonical (manifest-case) model name
        # BEFORE normalize_identifiers strips case from quoted identifiers.
        # Dialects with NORMALIZATION_STRATEGY = CASE_INSENSITIVE (BigQuery,
        # DuckDB) lowercase even backtick-quoted names, but BigQuery table
        # identifiers are case-sensitive at the storage layer — capturing the
        # alias-to-model map pre-normalize keeps the right model bound.
        alias_to_model, user_table_refs = self._build_alias_map(copy, user_cte_names)

        # Detect models referenced via SELECT * BEFORE qualify_columns
        # expands the star.  These will use SELECT * in transform_sql so
        # that wren-core controls column visibility (CLAC).
        star_models = self._detect_star_models(copy, alias_to_model)

        copy = normalize_identifiers(copy, dialect=self.dialect)
        qualified = qualify_columns(
            copy,
            schema=self.schema,
            dialect=self.dialect,
            allow_partial_qualification=True,
        )

        # Ensure every referenced model appears in the result, even if no
        # specific columns are referenced (e.g. SELECT COUNT(*) FROM model).
        # Use dict as ordered set to preserve insertion order and deduplicate.
        used: dict[str, dict[str, None]] = {m: {} for m in alias_to_model.values()}
        # Lowercase index for column.table lookups — column qualifier may have
        # been normalized (lowercased) by qualify_columns even though we built
        # the alias map from the pre-normalize AST.
        alias_lookup = {k.lower(): v for k, v in alias_to_model.items()}
        for col in qualified.find_all(exp.Column):
            table_ref = col.table
            if not table_ref:
                continue
            model_name = alias_lookup.get(table_ref.lower())
            if model_name:
                used[model_name][col.name] = None

        return (
            {m: None if m in star_models else list(cols) for m, cols in used.items()},
            user_table_refs,
        )

    def _build_alias_map(
        self, ast: exp.Expression, user_cte_names: set[str]
    ) -> tuple[dict[str, str], dict[str, tuple[str, bool]]]:
        """Map each table reference in *ast* to its canonical model name.

        Returns ``(alias_to_model, user_table_refs)`` — the second dict
        records the first user-written ``(name, quoted)`` per model so the
        CTE alias can be emitted with the same quoting style the user
        wrote, which is required for dialects with case-folding.

        Honours SQL identifier rules: quoted ⇒ case-sensitive, unquoted ⇒
        exact match preferred, then case-insensitive fallback. Skips tables
        that resolve to a user-defined CTE rather than an MDL model.
        """
        alias_to_model: dict[str, str] = {}
        user_table_refs: dict[str, tuple[str, bool]] = {}
        for table in ast.find_all(exp.Table):
            name = table.name
            if not name or name.lower() in user_cte_names:
                continue
            quoted = (
                bool(table.this.quoted)
                if isinstance(table.this, exp.Identifier)
                else False
            )
            model_name = resolve_model_name(name, quoted, self.model_dict)
            if model_name is None:
                continue
            alias = table.alias
            if alias:
                alias_to_model[alias] = model_name
            alias_to_model[name] = model_name
            user_table_refs.setdefault(model_name, (name, quoted))
        return alias_to_model, user_table_refs

    # ------------------------------------------------------------------
    # CTE generation
    # ------------------------------------------------------------------

    def _build_model_ctes(
        self,
        used_columns: dict[str, list[str] | None],
        user_table_refs: dict[str, tuple[str, bool]],
    ) -> list[exp.CTE]:
        """Generate one CTE per model via wren-core transform_sql."""
        ctes: list[exp.CTE] = []
        for model_name, columns in used_columns.items():
            if columns is None:
                # SELECT * — let wren-core handle column visibility (CLAC)
                model_sql = f'SELECT * FROM "{model_name}"'
            elif columns:
                # ``_col_orig_name`` is keyed by lowercase column names; the
                # column refs come from the post-normalize AST whose case
                # depends on the dialect (Oracle uppercases unquoted idents,
                # Postgres lowercases them). Lower-case before lookup so the
                # original manifest casing is restored either way.
                orig = self._col_orig_name.get(model_name, {})
                resolved = [orig.get(c.lower(), c) for c in columns]
                col_list = ", ".join(f'"{model_name}"."{c}"' for c in resolved)
                model_sql = f'SELECT {col_list} FROM "{model_name}"'
            else:
                # No specific columns referenced (e.g. COUNT(*)) — only need rows
                model_sql = f'SELECT 1 FROM "{model_name}"'
            expanded = self.session_context.transform_sql(model_sql)

            expanded_ast = parse_one(expanded, dialect="wren")
            # wren-core emits ``SELECT "<m>".col FROM (...) AS "<m>"`` using
            # the model name as the outermost subquery alias. Wrapping that
            # in ``WITH "<m>" AS (...)`` makes ``"<m>".col`` ambiguous to
            # BigQuery — it treats the qualifier as a recursive reference to
            # the CTE itself and rejects the query with "Table must be
            # qualified with a dataset". Rename the outermost alias to
            # ``wren_src_<m>`` (no leading underscore — Oracle ORA-00911) so
            # the shadow chain breaks at the top scope.
            self._rename_outer_alias(expanded_ast, model_name)

            # Match the user's literal identifier (case + quoting) for the
            # CTE alias so dialects with case-folding still bind the user's
            # outer ``FROM <model>`` to the CTE. Oracle uppercases unquoted
            # identifiers (so ``FROM orders`` resolves to ``ORDERS``); a
            # quoted CTE ``"orders"`` would never match. Falling back to
            # canonical model_name + quoted=True covers introspection-only
            # callers that build their own used_columns dict without a
            # user_table_refs entry.
            cte_name, cte_quoted = user_table_refs.get(model_name, (model_name, True))
            cte = exp.CTE(
                this=expanded_ast,
                alias=exp.TableAlias(
                    this=exp.to_identifier(cte_name, quoted=cte_quoted)
                ),
            )
            ctes.append(cte)
        return ctes

    @staticmethod
    def _rename_outer_alias(ast: exp.Expression, model_name: str) -> None:
        """Rename the outermost FROM-subquery alias matching *model_name*.

        Updates top-scope column refs that use *model_name* as their table
        qualifier. Does not descend into subqueries, so inner aliases are
        left intact.
        """
        if not isinstance(ast, exp.Select):
            return
        from_clause = ast.args.get("from_") or ast.args.get("from")
        if from_clause is None:
            return
        source = from_clause.this
        if isinstance(source, exp.Alias):
            source = source.this
        if not isinstance(source, exp.Subquery) or source.alias != model_name:
            return

        # Avoid a leading underscore — Oracle rejects unquoted identifiers
        # starting with ``_`` (ORA-00911) and downstream transpiles can drop
        # the quoting.
        new_alias = f"wren_src_{model_name}"
        source.set(
            "alias",
            exp.TableAlias(this=exp.to_identifier(new_alias, quoted=True)),
        )

        def rewrite(node: exp.Expression) -> None:
            # Stop at subquery boundaries — inner scopes have their own
            # alias bindings and must keep their existing qualifiers.
            if isinstance(node, (exp.Subquery, exp.CTE)):
                return
            if isinstance(node, exp.Column) and node.table == model_name:
                node.set("table", exp.to_identifier(new_alias, quoted=True))
            for child in node.args.values():
                if isinstance(child, list):
                    for c in child:
                        if isinstance(c, exp.Expression):
                            rewrite(c)
                elif isinstance(child, exp.Expression):
                    rewrite(child)

        # Visit every top-scope clause except FROM (already handled).
        for key in ("expressions", "where", "group", "having", "order", "qualify"):
            value = ast.args.get(key)
            if isinstance(value, list):
                for item in value:
                    if isinstance(item, exp.Expression):
                        rewrite(item)
            elif isinstance(value, exp.Expression):
                rewrite(value)

    # ------------------------------------------------------------------
    # CTE injection
    # ------------------------------------------------------------------

    def _inject_ctes(self, ast: exp.Expression, model_ctes: list[exp.CTE]) -> None:
        """Prepend *model_ctes* before any existing user CTEs in *ast*."""
        if not model_ctes:
            return

        existing_with = ast.args.get("with_")

        if existing_with:
            # Prepend model CTEs before user CTEs
            existing_ctes = list(existing_with.expressions)
            all_ctes = model_ctes + existing_ctes
            existing_with.set("expressions", all_ctes)
        else:
            with_clause = exp.With(expressions=model_ctes)
            ast.set("with_", with_clause)

        # Preserve RECURSIVE if the original WITH had it
        final_with = ast.args.get("with_")
        if existing_with and existing_with.args.get("recursive"):
            final_with.set("recursive", True)

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _detect_star_models(
        self, ast: exp.Expression, alias_to_model: dict[str, str]
    ) -> set[str]:
        """Detect models selected via ``*`` before column qualification.

        A bare ``SELECT *`` marks all models; ``SELECT t.*`` marks only
        the referenced model. *alias_to_model* is the case-aware mapping
        produced by ``_build_alias_map``.
        """
        star_models: set[str] = set()
        select = ast.find(exp.Select)
        if not select:
            return star_models

        for sel_expr in select.expressions:
            if isinstance(sel_expr, exp.Star):
                # Bare * → all models
                star_models.update(alias_to_model.values())
            elif isinstance(sel_expr, exp.Column) and isinstance(
                sel_expr.this, exp.Star
            ):
                # table.* → specific model
                table_ref = sel_expr.table
                if table_ref and table_ref in alias_to_model:
                    star_models.add(alias_to_model[table_ref])

        return star_models

    @staticmethod
    def _collect_user_cte_names(ast: exp.Expression) -> set[str]:
        """Collect all CTE names defined in the user's SQL (all scopes)."""
        names: set[str] = set()
        for with_clause in ast.find_all(exp.With):
            for cte in with_clause.expressions:
                alias = cte.args.get("alias")
                if alias:
                    raw = (
                        alias.this.name
                        if isinstance(alias.this, exp.Identifier)
                        else str(alias.this)
                    )
                    names.add(raw.lower())
        return names
