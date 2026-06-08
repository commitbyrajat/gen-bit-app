/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const hasColumn = await knex.schema.hasColumn(
    'workspace_project',
    'is_current',
  );
  if (!hasColumn) {
    await knex.schema.alterTable('workspace_project', (table) => {
      table.boolean('is_current').notNullable().defaultTo(false);
      table.index(['is_current'], 'workspace_project_is_current_idx');
    });
  }

  const current = await knex('workspace_project')
    .orderBy('is_default', 'desc')
    .orderBy('project_id', 'desc')
    .first();
  if (current) {
    await knex('workspace_project')
      .where({ id: current.id })
      .update({ is_current: true });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  const hasColumn = await knex.schema.hasColumn(
    'workspace_project',
    'is_current',
  );
  if (hasColumn) {
    await knex.schema.alterTable('workspace_project', (table) => {
      table.dropIndex(['is_current'], 'workspace_project_is_current_idx');
      table.dropColumn('is_current');
    });
  }
};
