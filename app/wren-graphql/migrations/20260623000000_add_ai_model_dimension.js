/**
 * @param { import("knex").Knex } knex
 */
exports.up = async function (knex) {
  await knex.schema.alterTable('ai_model', (table) => {
    table.integer('dimension').nullable();
  });

  await knex('ai_model')
    .where({ model_type: 'EMBEDDING' })
    .whereNull('dimension')
    .update({ dimension: 1536 });
};

/**
 * @param { import("knex").Knex } knex
 */
exports.down = async function (knex) {
  await knex.schema.alterTable('ai_model', (table) => {
    table.dropColumn('dimension');
  });
};
