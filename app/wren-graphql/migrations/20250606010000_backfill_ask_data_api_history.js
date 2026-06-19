/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const hasApiHistory = await knex.schema.hasTable('api_history');
  const hasThread = await knex.schema.hasTable('thread');
  const hasThreadResponse = await knex.schema.hasTable('thread_response');
  if (!hasApiHistory || !hasThread || !hasThreadResponse) return;

  const responses = await knex('thread_response')
    .join('thread', 'thread_response.thread_id', 'thread.id')
    .select(
      'thread_response.id',
      'thread_response.thread_id',
      'thread_response.question',
      'thread_response.sql',
      'thread_response.created_at',
      'thread_response.updated_at',
      'thread.project_id',
    );

  for (const response of responses) {
    const id = `ui-thread-response-${response.id}`;
    const exists = await knex('api_history').where({ id }).first();
    if (exists) continue;

    await knex('api_history').insert({
      id,
      project_id: response.project_id,
      api_type: 'ASK',
      thread_id: String(response.thread_id),
      request_payload: JSON.stringify({
        question: response.question,
        source: 'ASK_DATA_UI',
      }),
      response_payload: JSON.stringify({
        sql: response.sql,
      }),
      status_code: 200,
      duration_ms: 0,
      created_at: response.created_at,
      updated_at: response.updated_at,
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  const hasApiHistory = await knex.schema.hasTable('api_history');
  if (!hasApiHistory) return;

  await knex('api_history')
    .where('id', 'like', 'ui-thread-response-%')
    .delete();
};
