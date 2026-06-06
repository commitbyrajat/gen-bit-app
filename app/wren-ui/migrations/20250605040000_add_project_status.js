/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const hasStatus = await knex.schema.hasColumn('project', 'status');
  if (!hasStatus) {
    await knex.schema.alterTable('project', (table) => {
      table.string('status').notNullable().defaultTo('ACTIVE');
      table.index(['status'], 'project_status_idx');
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  const hasStatus = await knex.schema.hasColumn('project', 'status');
  if (hasStatus) {
    await knex.schema.alterTable('project', (table) => {
      table.dropIndex(['status'], 'project_status_idx');
      table.dropColumn('status');
    });
  }
};
