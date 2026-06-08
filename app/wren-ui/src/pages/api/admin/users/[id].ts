import type { NextApiRequest, NextApiResponse } from 'next';
import { hashSync } from 'bcryptjs';
import { components } from '@/common';
import { requireAnyApiPermission } from '@/apollo/server/admin';
import { Permission } from '@/utils/rbac';

const knex = components.knex;

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

  const id = Number(req.query.id);
  if (!id) {
    res.status(400).json({ error: 'User id is required' });
    return;
  }

  if (req.method === 'PATCH') {
    const { displayName, password, roleNames, tenantId, workspaceId, status } =
      req.body || {};

    try {
      await knex.transaction(async (trx) => {
        const updates: Record<string, any> = { updated_at: trx.fn.now() };
        if (displayName) updates.display_name = displayName.trim();
        if (password) updates.password_hash = hashSync(password, 10);
        if (Object.prototype.hasOwnProperty.call(req.body, 'tenantId')) {
          updates.tenant_id = tenantId || null;
        }
        if (Object.prototype.hasOwnProperty.call(req.body, 'workspaceId')) {
          updates.workspace_id = workspaceId || null;
        }
        if (status) updates.status = status;

        await trx('app_user').where({ id }).update(updates);
        await assignRoles(trx, id, roleNames);
      });

      res.status(200).json({ ok: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Unable to update user' });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
