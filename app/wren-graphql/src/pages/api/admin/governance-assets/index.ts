import type { NextApiRequest, NextApiResponse } from 'next';
import { components } from '@/common';
import { requireAnyApiPermission } from '@/apollo/server/admin';
import { Permission } from '@/utils/rbac';

const knex = components.knex;

const listAssets = async (assetType?: string) => {
  const query = knex('governance_asset')
    .leftJoin('tenant', 'governance_asset.tenant_id', 'tenant.id')
    .leftJoin('workspace', 'governance_asset.workspace_id', 'workspace.id')
    .leftJoin(
      'app_user as creator',
      'governance_asset.created_by_user_id',
      'creator.id',
    )
    .leftJoin(
      'app_user as decider',
      'governance_asset.decided_by_user_id',
      'decider.id',
    )
    .orderBy('governance_asset.id', 'desc')
    .select(
      'governance_asset.id',
      'governance_asset.asset_type',
      'governance_asset.name',
      'governance_asset.description',
      'governance_asset.tenant_id',
      'governance_asset.workspace_id',
      'governance_asset.status',
      'governance_asset.created_at',
      'governance_asset.decided_at',
      'tenant.name as tenant_name',
      'workspace.name as workspace_name',
      'creator.display_name as created_by',
      'decider.display_name as decided_by',
    );

  if (assetType) {
    query.where('governance_asset.asset_type', assetType);
  }

  return query;
};

const getAllowedPermissions = (assetType?: string) => {
  if (assetType === 'APPROVAL') {
    return [Permission.MANAGE_DASHBOARD, Permission.MANAGE_WORKSPACE];
  }
  return [Permission.MANAGE_KNOWLEDGE, Permission.MANAGE_MODELING];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const assetType = String(req.query.type || req.body?.assetType || '');
  const user = await requireAnyApiPermission(
    knex,
    req,
    res,
    getAllowedPermissions(assetType),
  );
  if (!user) return;

  if (req.method === 'GET') {
    const [assets, tenants, workspaces] = await Promise.all([
      listAssets(assetType || undefined),
      knex('tenant').whereNot({ status: 'DELETED' }).orderBy('name'),
      knex('workspace').whereNot({ status: 'DELETED' }).orderBy('name'),
    ]);
    res.status(200).json({ assets, tenants, workspaces });
    return;
  }

  if (req.method === 'POST') {
    const {
      name,
      description,
      tenantId,
      workspaceId,
      status = assetType === 'APPROVAL' ? 'PENDING' : 'DRAFT',
    } = req.body || {};

    if (!assetType || !name) {
      res.status(400).json({ error: 'Asset type and name are required' });
      return;
    }

    await knex('governance_asset').insert({
      asset_type: assetType,
      name: name.trim(),
      description: description || null,
      tenant_id: tenantId || user.tenantId || null,
      workspace_id: workspaceId || user.workspaceId || null,
      created_by_user_id: user.id,
      status,
    });

    res.status(201).json({ assets: await listAssets(assetType) });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
