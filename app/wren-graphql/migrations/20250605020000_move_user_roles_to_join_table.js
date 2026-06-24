const ROLES = [
  ['PLATFORM_SUPER_ADMIN', 'Platform Super Admin'],
  ['PLATFORM_SECURITY_ADMIN', 'Platform Security Admin'],
  ['PLATFORM_OPERATIONS_ADMIN', 'Platform Operations Admin'],
  ['TENANT_ADMIN', 'Tenant Admin'],
  ['TENANT_DATA_STEWARD', 'Tenant Data Steward'],
  ['TENANT_DEVELOPER', 'Tenant Developer'],
  ['WORKSPACE_OWNER', 'Workspace Owner'],
  ['WORKSPACE_EDITOR', 'Workspace Editor'],
  ['WORKSPACE_VIEWER', 'Workspace Viewer'],
  ['BUSINESS_USER', 'Business User'],
];

const ensureTable = async (knex, tableName, createTable) => {
  const exists = await knex.schema.hasTable(tableName);
  if (!exists) {
    await knex.schema.createTable(tableName, createTable);
  }
};

const ensureRoleRows = async (knex) => {
  for (const [name, displayName] of ROLES) {
    const existingRole = await knex('app_role').where({ name }).first();
    if (!existingRole) {
      await knex('app_role').insert({
        name,
        display_name: displayName,
        status: 'ACTIVE',
      });
    }
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await ensureTable(knex, 'app_role', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable().unique();
    table.string('display_name').notNullable();
    table.string('status').notNullable().defaultTo('ACTIVE');
    table.timestamps(true, true);
  });

  await ensureRoleRows(knex);

  await ensureTable(knex, 'app_user_role', (table) => {
    table.increments('id').primary();
    table.integer('app_user_id').notNullable();
    table.integer('app_role_id').notNullable();
    table.timestamps(true, true);

    table.foreign('app_user_id').references('app_user.id').onDelete('CASCADE');
    table.foreign('app_role_id').references('app_role.id').onDelete('CASCADE');
    table.unique(['app_user_id', 'app_role_id'], {
      indexName: 'app_user_role_user_id_role_id_unique',
    });
    table.index(['app_role_id'], 'app_user_role_role_id_idx');
  });

  const hasRoleColumn = await knex.schema.hasColumn('app_user', 'role');
  if (hasRoleColumn) {
    const users = await knex('app_user').select('id', 'role');
    for (const user of users) {
      if (!user.role) continue;
      const role = await knex('app_role')
        .where({ name: user.role })
        .first('id');
      if (!role) continue;

      const existingUserRole = await knex('app_user_role')
        .where({
          app_user_id: user.id,
          app_role_id: role.id,
        })
        .first();

      if (!existingUserRole) {
        await knex('app_user_role').insert({
          app_user_id: user.id,
          app_role_id: role.id,
        });
      }
    }

    try {
      await knex.schema.alterTable('app_user', (table) => {
        table.dropIndex(['role'], 'app_user_role_idx');
      });
    } catch {
      // Some local databases may have the legacy column without the index.
    }

    await knex.schema.alterTable('app_user', (table) => {
      table.dropColumn('role');
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  const hasRoleColumn = await knex.schema.hasColumn('app_user', 'role');
  if (!hasRoleColumn) {
    await knex.schema.alterTable('app_user', (table) => {
      table.string('role').nullable();
      table.index(['role'], 'app_user_role_idx');
    });
  }

  const userRoles = await knex('app_user_role')
    .join('app_role', 'app_user_role.app_role_id', 'app_role.id')
    .select('app_user_role.app_user_id', 'app_role.name');

  for (const userRole of userRoles) {
    await knex('app_user')
      .where({ id: userRole.app_user_id })
      .whereNull('role')
      .update({ role: userRole.name });
  }

  await knex.schema.dropTableIfExists('app_user_role');
  await knex.schema.dropTableIfExists('app_role');
};
