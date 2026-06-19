import type { NextApiRequest, NextApiResponse } from 'next';
import { components } from '@/common';
import { requireAnyApiPermission } from '@/apollo/server/admin';
import { Permission } from '@/utils/rbac';

const knex = components.knex;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const id = Number(req.query.id);
  if (!id) {
    res.status(400).json({ error: 'Asset id is required' });
    return;
  }

  const asset = await knex('governance_asset').where({ id }).first();
  if (!asset) {
    res.status(404).json({ error: 'Asset not found' });
    return;
  }

  const permissions =
    asset.asset_type === 'APPROVAL'
      ? [Permission.MANAGE_WORKSPACE]
      : [Permission.MANAGE_KNOWLEDGE, Permission.MANAGE_MODELING];
  const user = await requireAnyApiPermission(knex, req, res, permissions);
  if (!user) return;

  if (req.method === 'PATCH') {
    const { name, description, tenantId, workspaceId, status } = req.body || {};
    const updates: Record<string, any> = { updated_at: knex.fn.now() };
    if (name) updates.name = name.trim();
    if (Object.prototype.hasOwnProperty.call(req.body, 'description')) {
      updates.description = description || null;
    }
    if (Object.prototype.hasOwnProperty.call(req.body, 'tenantId')) {
      updates.tenant_id = tenantId || null;
    }
    if (Object.prototype.hasOwnProperty.call(req.body, 'workspaceId')) {
      updates.workspace_id = workspaceId || null;
    }
    if (status) {
      updates.status = status;
      if (['APPROVED', 'REJECTED', 'CERTIFIED'].includes(status)) {
        updates.decided_by_user_id = user.id;
        updates.decided_at = knex.fn.now();
      }
    }

    await knex('governance_asset').where({ id }).update(updates);
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
