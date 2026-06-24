/**
 * @param { import("knex").Knex } knex
 */
exports.up = async function (knex) {
  await knex.schema.createTable('ai_model', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('model_id').notNullable();
    table.string('provider').notNullable().defaultTo('litellm');
    table.string('base_url').notNullable();
    table.string('model_type').notNullable();
    table.string('status').notNullable().defaultTo('ACTIVE');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.unique(['model_id', 'base_url'], {
      indexName: 'ai_model_model_id_base_url_unique',
    });
    table.index(['model_type'], 'ai_model_model_type_idx');
    table.index(['status'], 'ai_model_status_idx');
  });

  await knex.schema.createTable('tenant_ai_model', (table) => {
    table.increments('id').primary();
    table.integer('tenant_id').notNullable();
    table.integer('ai_model_id').notNullable();
    table.string('usage_type').notNullable();
    table.text('api_key_base64').notNullable();
    table.string('status').notNullable().defaultTo('ACTIVE');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.foreign('tenant_id').references('tenant.id').onDelete('CASCADE');
    table.foreign('ai_model_id').references('ai_model.id').onDelete('CASCADE');
    table.unique(['tenant_id', 'usage_type'], {
      indexName: 'tenant_ai_model_tenant_usage_unique',
    });
    table.unique(['tenant_id', 'ai_model_id'], {
      indexName: 'tenant_ai_model_tenant_model_unique',
    });
    table.index(['tenant_id'], 'tenant_ai_model_tenant_id_idx');
    table.index(['ai_model_id'], 'tenant_ai_model_ai_model_id_idx');
  });
};

/**
 * @param { import("knex").Knex } knex
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('tenant_ai_model');
  await knex.schema.dropTableIfExists('ai_model');
};
