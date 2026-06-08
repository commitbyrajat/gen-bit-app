/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const exists = await knex.schema.hasTable('governance_asset');
  if (exists) return;

  await knex.schema.createTable('governance_asset', (table) => {
    table.increments('id').primary();
    table.string('asset_type').notNullable();
    table.string('name').notNullable();
    table.text('description').nullable();
    table.integer('tenant_id').nullable();
    table.integer('workspace_id').nullable();
    table.integer('created_by_user_id').nullable();
    table.integer('decided_by_user_id').nullable();
    table.string('status').notNullable().defaultTo('DRAFT');
    table.timestamp('decided_at').nullable();
    table.timestamps(true, true);

    table.foreign('tenant_id').references('tenant.id').onDelete('SET NULL');
    table
      .foreign('workspace_id')
      .references('workspace.id')
      .onDelete('SET NULL');
    table
      .foreign('created_by_user_id')
      .references('app_user.id')
      .onDelete('SET NULL');
    table
      .foreign('decided_by_user_id')
      .references('app_user.id')
      .onDelete('SET NULL');
    table.index(['asset_type', 'status'], 'governance_asset_type_status_idx');
    table.index(['tenant_id'], 'governance_asset_tenant_id_idx');
    table.index(['workspace_id'], 'governance_asset_workspace_id_idx');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('governance_asset');
};
