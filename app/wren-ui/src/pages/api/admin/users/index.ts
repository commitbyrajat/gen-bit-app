import type { NextApiRequest, NextApiResponse } from 'next';
import { hashSync } from 'bcryptjs';
import { components } from '@/common';
import { requireAnyApiPermission } from '@/apollo/server/admin';
import { Permission } from '@/utils/rbac';

const knex = components.knex;

const listUsers = async () => {
  const users = await knex('app_user')
    .leftJoin('tenant', 'app_user.tenant_id', 'tenant.id')
    .leftJoin('workspace', 'app_user.workspace_id', 'workspace.id')
    .orderBy('app_user.id')
    .select(
      'app_user.id',
      'app_user.adid',
      'app_user.display_name',
      'app_user.tenant_id',
      'app_user.workspace_id',
      'app_user.status',
      'app_user.last_login_at',
      'tenant.name as tenant_name',
      'workspace.name as workspace_name',
    );

  const assignments = await knex('app_user_role')
    .join('app_role', 'app_user_role.app_role_id', 'app_role.id')
    .select(
      'app_user_role.app_user_id',
      'app_role.id as role_id',
      'app_role.name',
      'app_role.display_name',
    );

  return users.map((user) => ({
    ...user,
    roles: assignments
      .filter((assignment) => assignment.app_user_id === user.id)
      .map((assignment) => ({
        id: assignment.role_id,
        name: assignment.name,
        displayName: assignment.display_name,
      })),
  }));
};

const assignRoles = async (
  trx,
  userId: number,
  roleNames: string[] | undefined,
) => {
  if (!Array.isArray(roleNames)) return;

  const roles = roleNames.length
    ? await trx('app_role').whereIn('name', roleNames).select('id')
    : [];

  await trx('app_user_role').where({ app_user_id: userId }).delete();
  if (roles.length) {
    await trx('app_user_role').insert(
      roles.map((role) => ({
        app_user_id: userId,
        app_role_id: role.id,
      })),
    );
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const user = await requireAnyApiPermission(knex, req, res, [
    Permission.MANAGE_TENANT,
  ]);
  if (!user) return;

  if (req.method === 'GET') {
    const [roles, tenants, workspaces] = await Promise.all([
      knex('app_role').where({ status: 'ACTIVE' }).orderBy('id'),
      knex('tenant').whereNot({ status: 'DELETED' }).orderBy('name'),
      knex('workspace').whereNot({ status: 'DELETED' }).orderBy('name'),
    ]);
    res.status(200).json({
      users: await listUsers(),
      roles,
      tenants,
      workspaces,
    });
    return;
  }

  if (req.method === 'POST') {
    const {
      adid,
      displayName,
      password = 'Password@123',
      roleNames,
      tenantId,
      workspaceId,
      status = 'ACTIVE',
    } = req.body || {};

    if (!adid || !displayName) {
      res.status(400).json({ error: 'ADID and display name are required' });
      return;
    }

    try {
      await knex.transaction(async (trx) => {
        const [userId] = await trx('app_user')
          .insert({
            adid: adid.trim().toUpperCase(),
            display_name: displayName.trim(),
            password_hash: hashSync(password, 10),
            tenant_id: tenantId || null,
            workspace_id: workspaceId || null,
            status,
          })
          .returning('id');

        const id = typeof userId === 'object' ? userId.id : userId;
        await assignRoles(trx, Number(id), roleNames);
      });

      res.status(201).json({ users: await listUsers() });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Unable to create user' });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
