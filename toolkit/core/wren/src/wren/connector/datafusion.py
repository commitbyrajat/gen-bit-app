from __future__ import annotations

import io
from pathlib import Path

import pyarrow as pa
import pyarrow.ipc as ipc
from loguru import logger

from wren.connector.base import ConnectorABC
from wren.model import DataFusionConnectionInfo
from wren.model.error import ErrorCode, WrenError


def _preview_sql(sql: str, max_len: int = 240) -> str:
    return " ".join(sql.split())[:max_len]


class DataFusionConnector(ConnectorABC):
    """DataFusion-native connector for local file analysis.

    Uses wren-core-py's LocalRuntime mode to execute SQL directly via
    DataFusion.
    """

    def __init__(self, connection_info: DataFusionConnectionInfo):
        from wren_core import SessionContext  # noqa: PLC0415

        self.ctx = SessionContext()
        self.source = Path(connection_info.source).resolve()
        self.format = connection_info.format
        logger.info(
            f"DataFusion connector initialized source={self.source} format={self.format}"
        )
        self._register_tables()

    def query(self, sql: str, limit: int | None = None) -> pa.Table:
        logger.info(
            f'DataFusion query requested source={self.source} limit={limit} sql="{_preview_sql(sql)}"'
        )
        if limit is not None:
            sql = f"SELECT * FROM ({sql}) AS _q LIMIT {int(limit)}"
        ipc_bytes = self.ctx.query(sql)
        reader = ipc.open_stream(io.BytesIO(bytes(ipc_bytes)))
        table = reader.read_all()
        logger.info(
            f"DataFusion query completed source={self.source} rows={table.num_rows} columns={table.num_columns}"
        )
        return table

    def dry_run(self, sql: str) -> None:
        logger.info(
            f'DataFusion dry_run requested source={self.source} sql="{_preview_sql(sql)}"'
        )
        self.ctx.dry_run(sql)
        logger.info(f"DataFusion dry_run completed source={self.source}")

    def close(self) -> None:
        pass

    _SUPPORTED_FORMATS = {"parquet", "csv"}

    def _register_tables(self) -> None:
        """Auto-discover and register files from source directory."""
        if self.format not in self._SUPPORTED_FORMATS:
            raise WrenError(
                ErrorCode.GENERIC_USER_ERROR,
                f"Unsupported format '{self.format}'. "
                f"Supported: {', '.join(sorted(self._SUPPORTED_FORMATS))}",
            )
        if not self.source.is_dir():
            raise WrenError(
                ErrorCode.GENERIC_USER_ERROR,
                f"Source directory not found: {self.source}",
            )

        glob_pattern = f"*.{self.format}"
        registered = []
        for file_path in sorted(self.source.glob(glob_pattern)):
            table_name = file_path.stem
            try:
                if self.format == "parquet":
                    self.ctx.register_parquet(table_name, str(file_path))
                else:
                    self.ctx.register_csv(table_name, str(file_path))
                registered.append(table_name)
            except Exception as e:
                raise WrenError(
                    ErrorCode.GENERIC_USER_ERROR,
                    f"Failed to register {file_path.name}: {e!s}",
                ) from e

        if not registered:
            raise WrenError(
                ErrorCode.GENERIC_USER_ERROR,
                f"No .{self.format} files found in {self.source}",
            )

        logger.info(
            f"Registered {len(registered)} tables from {self.source}: {registered}"
        )


def create_connector(connection_info) -> DataFusionConnector:
    return DataFusionConnector(connection_info)
