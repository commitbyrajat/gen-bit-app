const bcrypt = require('bcryptjs');

const SEEDED_PASSWORD = 'Password@123';
const SEEDED_USERS = [
  ['PSA001', 'Platform Super Admin', 'PLATFORM_SUPER_ADMIN'],
  ['PSEC001', 'Platform Security Admin', 'PLATFORM_SECURITY_ADMIN'],
  ['POPS001', 'Platform Operations Admin', 'PLATFORM_OPERATIONS_ADMIN'],
  ['TADM001', 'Tenant Admin', 'TENANT_ADMIN'],
  ['TDST001', 'Tenant Data Steward', 'TENANT_DATA_STEWARD'],
  ['TDEV001', 'Tenant Developer', 'TENANT_DEVELOPER'],
  ['WOWN001', 'Workspace Owner', 'WORKSPACE_OWNER'],
  ['WEDT001', 'Workspace Editor', 'WORKSPACE_EDITOR'],
  ['WVWR001', 'Workspace Viewer', 'WORKSPACE_VIEWER'],
  ['BUSR001', 'Business User', 'BUSINESS_USER'],
];

const ensureTable = async (knex, tableName, createTable) => {
  const exists = await knex.schema.hasTable(tableName);
  if (!exists) {
    await knex.schema.createTable(tableName, createTable);
  }
};

const ensureColumn = async (knex, tableName, columnName, addColumn) => {
  const exists = await knex.schema.hasColumn(tableName, columnName);
  if (!exists) {
    await knex.schema.alterTable(tableName, addColumn);
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const hasProjectTable = await knex.schema.hasTable('project');

  await ensureTable(knex, 'tenant', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('slug').notNullable().unique();
    table.string('status').notNullable().defaultTo('ACTIVE');
    table.timestamps(true, true);
  });

  await ensureTable(knex, 'workspace', (table) => {
    table.increments('id').primary();
    table.integer('tenant_id').notNullable().comment('Reference to tenant.id');
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

  if (hasProjectTable) {
    await ensureTable(knex, 'workspace_project', (table) => {
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

      table
        .foreign('workspace_id')
        .references('workspace.id')
        .onDelete('CASCADE');
      table.foreign('project_id').references('project.id').onDelete('CASCADE');
      table.unique(['workspace_id', 'project_id'], {
        indexName: 'workspace_project_workspace_id_project_id_unique',
      });
      table.index(['project_id']);
    });
  }

  await ensureTable(knex, 'app_user', (table) => {
    table.increments('id').primary();
    table.string('adid').notNullable().unique();
    table.string('display_name').notNullable();
    table.string('password_hash').notNullable();
    table.string('role').notNullable();
    table
      .integer('tenant_id')
      .nullable()
      .comment('Default tenant scope for tenant/workspace roles');
    table
      .integer('workspace_id')
      .nullable()
      .comment('Default workspace scope for workspace roles');
    table.string('status').notNullable().defaultTo('ACTIVE');
    table.timestamp('last_login_at').nullable();
    table.timestamps(true, true);

    table.foreign('tenant_id').references('tenant.id').onDelete('SET NULL');
    table
      .foreign('workspace_id')
      .references('workspace.id')
      .onDelete('SET NULL');
    table.index(['role'], 'app_user_role_idx');
    table.index(['tenant_id'], 'app_user_tenant_id_idx');
    table.index(['workspace_id'], 'app_user_workspace_id_idx');
  });

  await ensureColumn(knex, 'app_user', 'display_name', (table) => {
    table.string('display_name').nullable();
  });
  await ensureColumn(knex, 'app_user', 'password_hash', (table) => {
    table.string('password_hash').nullable();
  });
  await ensureColumn(knex, 'app_user', 'role', (table) => {
    table.string('role').nullable();
  });
  await ensureColumn(knex, 'app_user', 'tenant_id', (table) => {
    table
      .integer('tenant_id')
      .nullable()
      .comment('Default tenant scope for tenant/workspace roles');
  });
  await ensureColumn(knex, 'app_user', 'workspace_id', (table) => {
    table
      .integer('workspace_id')
      .nullable()
      .comment('Default workspace scope for workspace roles');
  });
  await ensureColumn(knex, 'app_user', 'status', (table) => {
    table.string('status').notNullable().defaultTo('ACTIVE');
  });
  await ensureColumn(knex, 'app_user', 'last_login_at', (table) => {
    table.timestamp('last_login_at').nullable();
  });
  await ensureColumn(knex, 'app_user', 'created_at', (table) => {
    table.timestamp('created_at').nullable();
  });
  await ensureColumn(knex, 'app_user', 'updated_at', (table) => {
    table.timestamp('updated_at').nullable();
  });

  if (hasProjectTable) {
    await ensureColumn(knex, 'project', 'tenant_id', (table) => {
      table
        .integer('tenant_id')
        .nullable()
        .comment('Owning tenant for this data connection');
      table.foreign('tenant_id').references('tenant.id').onDelete('SET NULL');
      table.index(['tenant_id'], 'project_tenant_id_idx');
    });
  }

  let defaultTenant = await knex('tenant').where({ slug: 'default' }).first();
  if (!defaultTenant) {
    await knex('tenant').insert({
      name: 'Default Tenant',
      slug: 'default',
      status: 'ACTIVE',
    });
    defaultTenant = await knex('tenant').where({ slug: 'default' }).first();
  }

  let defaultWorkspace = await knex('workspace')
    .where({ tenant_id: defaultTenant.id, slug: 'default' })
    .first();
  if (!defaultWorkspace) {
    await knex('workspace').insert({
      tenant_id: defaultTenant.id,
      name: 'Default Workspace',
      slug: 'default',
      status: 'ACTIVE',
    });
    defaultWorkspace = await knex('workspace')
      .where({ tenant_id: defaultTenant.id, slug: 'default' })
      .first();
  }

  const passwordHash = bcrypt.hashSync(SEEDED_PASSWORD, 10);
  for (const [adid, displayName, role] of SEEDED_USERS) {
    const existingUser = await knex('app_user').where({ adid }).first();
    if (!existingUser) {
      await knex('app_user').insert({
        adid,
        display_name: displayName,
        password_hash: passwordHash,
        role,
        tenant_id: role.startsWith('PLATFORM_') ? null : defaultTenant.id,
        workspace_id:
          role.startsWith('WORKSPACE_') || role === 'BUSINESS_USER'
            ? defaultWorkspace.id
            : null,
        status: 'ACTIVE',
      });
    }
  }

  if (hasProjectTable) {
    const projects = await knex('project').select('id').orderBy('id');
    if (projects.length) {
      await knex('project')
        .whereNull('tenant_id')
        .update({ tenant_id: defaultTenant.id });

      const latestProjectId = projects[projects.length - 1].id;
      for (const project of projects) {
        const existingWorkspaceProject = await knex('workspace_project')
          .where({
            workspace_id: defaultWorkspace.id,
            project_id: project.id,
          })
          .first();

        if (!existingWorkspaceProject) {
          await knex('workspace_project').insert({
            workspace_id: defaultWorkspace.id,
            project_id: project.id,
            is_default: project.id === latestProjectId,
          });
        }
      }
    }
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function () {
  // Intentionally left blank. This migration repairs an already-recorded
  // foundation migration and should not remove tenant/auth data on rollback.
};
