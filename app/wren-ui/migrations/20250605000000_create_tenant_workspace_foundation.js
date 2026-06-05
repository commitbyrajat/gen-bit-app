/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable('tenant', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('slug').notNullable().unique();
    table.string('status').notNullable().defaultTo('ACTIVE');
    table.timestamps(true, true);
  });

  await knex.schema.createTable('workspace', (table) => {
    table.increments('id').primary();
    table
      .integer('tenant_id')
      .notNullable()
      .comment('Reference to tenant.id');
    table.string('name').notNullable();
    table.string('slug').notNullable();
    table.string('status').notNullable().defaultTo('ACTIVE');
    table.timestamps(true, true);

    table.foreign('tenant_id').references('tenant.id').onDelete('CASCADE');
    table.unique(['tenant_id', 'slug'], {
      indexName: 'workspace_tenant_id_slug_unique',
    });
    table.index(['tenant_id']);
  });

  await knex.schema.createTable('workspace_project', (table) => {
    table.increments('id').primary();
    table
      .integer('workspace_id')
      .notNullable()
      .comment('Reference to workspace.id');
    table
      .integer('project_id')
      .notNullable()
      .comment('Reference to project.id, used as data connection id');
    table.boolean('is_default').notNullable().defaultTo(false);
    table.timestamps(true, true);

    table.foreign('workspace_id').references('workspace.id').onDelete('CASCADE');
    table.foreign('project_id').references('project.id').onDelete('CASCADE');
    table.unique(['workspace_id', 'project_id'], {
      indexName: 'workspace_project_workspace_id_project_id_unique',
    });
    table.index(['project_id']);
  });

  await knex.schema.alterTable('project', (table) => {
    table
      .integer('tenant_id')
      .nullable()
      .comment('Owning tenant for this data connection');
    table.foreign('tenant_id').references('tenant.id').onDelete('SET NULL');
    table.index(['tenant_id'], 'project_tenant_id_idx');
  });

  await knex('tenant').insert({
    name: 'Default Tenant',
    slug: 'default',
    status: 'ACTIVE',
  });
  const defaultTenant = await knex('tenant')
    .where({ slug: 'default' })
    .first('id');

  await knex('workspace').insert({
    tenant_id: defaultTenant.id,
    name: 'Default Workspace',
    slug: 'default',
    status: 'ACTIVE',
  });
  const defaultWorkspace = await knex('workspace')
    .where({ tenant_id: defaultTenant.id, slug: 'default' })
    .first('id');

  const projects = await knex('project').select('id').orderBy('id');
  if (projects.length) {
    await knex('project').update({ tenant_id: defaultTenant.id });
    await knex('workspace_project').insert(
      projects.map((project, index) => ({
        workspace_id: defaultWorkspace.id,
        project_id: project.id,
        is_default: index === projects.length - 1,
      })),
    );
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.alterTable('project', (table) => {
    table.dropIndex(['tenant_id'], 'project_tenant_id_idx');
    table.dropForeign(['tenant_id']);
    table.dropColumn('tenant_id');
  });
  await knex.schema.dropTableIfExists('workspace_project');
  await knex.schema.dropTableIfExists('workspace');
  await knex.schema.dropTableIfExists('tenant');
};
