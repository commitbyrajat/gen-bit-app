const bcrypt = require('bcryptjs');

const SEEDED_PASSWORD = 'Password@123';

const APPS = [
  {
    prefix: 'LOAN',
    tenant: {
      name: 'Loans',
      slug: 'loans',
    },
    workspace: {
      name: 'Loans Workspace',
      slug: 'loans',
    },
  },
  {
    prefix: 'WEALTH',
    tenant: {
      name: 'Wealth',
      slug: 'wealth',
    },
    workspace: {
      name: 'Wealth Workspace',
      slug: 'wealth',
    },
  },
];

const USERS = [
  ['TADM001', 'Tenant Admin', 'TENANT_ADMIN', false],
  ['TDST001', 'Tenant Data Steward', 'TENANT_DATA_STEWARD', false],
  ['TDEV001', 'Tenant Developer', 'TENANT_DEVELOPER', false],
  ['WOWN001', 'Workspace Owner', 'WORKSPACE_OWNER', true],
  ['WEDT001', 'Workspace Editor', 'WORKSPACE_EDITOR', true],
  ['WVWR001', 'Workspace Viewer', 'WORKSPACE_VIEWER', true],
  ['BUSR001', 'Business User', 'BUSINESS_USER', true],
];

const ensureTenant = async (knex, tenant) => {
  let row = await knex('tenant').where({ slug: tenant.slug }).first();
  if (!row) {
    await knex('tenant').insert({
      name: tenant.name,
      slug: tenant.slug,
      status: 'ACTIVE',
    });
    row = await knex('tenant').where({ slug: tenant.slug }).first();
  }
  return row;
};

const ensureWorkspace = async (knex, tenantId, workspace) => {
  let row = await knex('workspace')
    .where({ tenant_id: tenantId, slug: workspace.slug })
    .first();
  if (!row) {
    await knex('workspace').insert({
      tenant_id: tenantId,
      name: workspace.name,
      slug: workspace.slug,
      status: 'ACTIVE',
    });
    row = await knex('workspace')
      .where({ tenant_id: tenantId, slug: workspace.slug })
      .first();
  }
  return row;
};

const assignRole = async (knex, userId, roleName) => {
  const role = await knex('app_role').where({ name: roleName }).first('id');
  if (!role) {
    throw new Error(`Required role ${roleName} does not exist`);
  }

  const assignment = await knex('app_user_role')
    .where({
      app_user_id: userId,
      app_role_id: role.id,
    })
    .first();
  if (!assignment) {
    await knex('app_user_role').insert({
      app_user_id: userId,
      app_role_id: role.id,
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const passwordHash = bcrypt.hashSync(SEEDED_PASSWORD, 10);

  for (const app of APPS) {
    const tenant = await ensureTenant(knex, app.tenant);
    const workspace = await ensureWorkspace(knex, tenant.id, app.workspace);

    for (const [code, roleLabel, roleName, hasWorkspaceScope] of USERS) {
      const adid = `${app.prefix}_${code}`;
      let user = await knex('app_user').where({ adid }).first();

      if (!user) {
        await knex('app_user').insert({
          adid,
          display_name: `${app.tenant.name} ${roleLabel}`,
          password_hash: passwordHash,
          tenant_id: tenant.id,
          workspace_id: hasWorkspaceScope ? workspace.id : null,
          status: 'ACTIVE',
        });
        user = await knex('app_user').where({ adid }).first();
      }

      await assignRole(knex, user.id, roleName);
    }
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  const adids = APPS.flatMap((app) =>
    USERS.map(([code]) => `${app.prefix}_${code}`),
  );
  const users = await knex('app_user').whereIn('adid', adids).select('id');
  const userIds = users.map((user) => user.id);

  if (userIds.length) {
    await knex('app_user_role').whereIn('app_user_id', userIds).delete();
    await knex('app_user').whereIn('id', userIds).delete();
  }

  for (const app of [...APPS].reverse()) {
    const tenant = await knex('tenant')
      .where({ slug: app.tenant.slug })
      .first('id');
    if (!tenant) continue;

    await knex('workspace')
      .where({
        tenant_id: tenant.id,
        slug: app.workspace.slug,
      })
      .delete();
    await knex('tenant').where({ id: tenant.id }).delete();
  }
};
