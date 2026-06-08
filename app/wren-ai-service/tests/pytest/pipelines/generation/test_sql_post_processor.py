import pytest

from src.pipelines.generation.utils.sql import (
    SQLGenPostProcessor,
    _extract_sql_generation_result,
)


class FakeEngine:
    def __init__(self):
        self.dry_plan_calls = []
        self.execute_sql_calls = []

    async def dry_plan(self, *args, **kwargs):
        self.dry_plan_calls.append((args, kwargs))
        return True, ""

    async def execute_sql(self, *args, **kwargs):
        self.execute_sql_calls.append((args, kwargs))
        return True, None, {"correlation_id": "test-correlation-id"}


def test_extract_sql_generation_result_from_json():
    sql, error = _extract_sql_generation_result('{"sql":"SELECT 1"}')

    assert sql == "SELECT 1"
    assert error is None


def test_extract_sql_generation_result_rejects_truncated_json():
    sql, error = _extract_sql_generation_result('{"sql":"SELECT "')

    assert sql is None
    assert error is not None
    assert "malformed JSON" in error


@pytest.mark.asyncio
async def test_post_processor_returns_invalid_result_for_truncated_json():
    engine = FakeEngine()
    post_processor = SQLGenPostProcessor(engine=engine)

    result = await post_processor.run(['{"sql":"SELECT "'])

    assert result["valid_generation_result"] == {}
    invalid = result["invalid_generation_result"]
    assert invalid["type"] == "SQL_GENERATION"
    assert invalid["original_sql"] == '{"sql":"SELECT "'
    assert "malformed JSON" in invalid["error"]
    assert engine.execute_sql_calls == []
    assert engine.dry_plan_calls == []
