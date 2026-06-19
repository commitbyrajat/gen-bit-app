import type { NextApiRequest, NextApiResponse } from 'next';
import { components } from '@/common';
import { requireAnyApiPermission, slugify } from '@/apollo/server/admin';
import { Permission, hasPermission } from '@/utils/rbac';

const knex = components.knex;

const listWorkspaces = async (tenantId?: number | null) => {
  const query = knex('workspace')
    .join('tenant', 'workspace.tenant_id', 'tenant.id')
    .leftJoin('app_user', 'workspace.id', 'app_user.workspace_id')
    .groupBy('workspace.id', 'tenant.id')
    .orderBy('workspace.id')
    .select(
      'workspace.id',
      'workspace.tenant_id',
      'workspace.name',
      'workspace.slug',
      'workspace.status',
      'workspace.created_at',
      'tenant.name as tenant_name',
      knex.raw('count(distinct app_user.id) as member_count'),
    );

  if (tenantId) {
    query.where('workspace.tenant_id', tenantId);
  }

  const workspaces = await query;
  return workspaces.map((workspace) => ({
    ...workspace,
    memberCount: Number(workspace.member_count || 0),
  }));
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const user = await requireAnyApiPermission(knex, req, res, [
    Permission.MANAGE_PLATFORM,
    Permission.MANAGE_TENANT,
    Permission.MANAGE_WORKSPACE,
    Permission.MANAGE_DATA_SOURCE,
  ]);
  if (!user) return;

  if (req.method === 'GET') {
    const canManagePlatform = hasPermission(
      user.roles,
      Permission.MANAGE_PLATFORM,
    );
    const tenantId = canManagePlatform ? null : user.tenantId;
    const tenantsQuery = knex('tenant')
      .whereNot({ status: 'DELETED' })
      .orderBy('name')
      .select('id', 'name', 'slug', 'status');
    if (tenantId) {
      tenantsQuery.where({ id: tenantId });
    } else if (!canManagePlatform) {
      res.status(200).json({ workspaces: [], tenants: [] });
      return;
    }
    const tenants = await tenantsQuery;
    res.status(200).json({
      workspaces: await listWorkspaces(tenantId),
      tenants,
    });
    return;
  }

  if (req.method === 'POST') {
    if (
      !hasPermission(user.roles, Permission.MANAGE_TENANT) &&
      !hasPermission(user.roles, Permission.MANAGE_WORKSPACE)
    ) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const { tenantId, name, slug, status = 'ACTIVE' } = req.body || {};
    if (!tenantId || !name) {
      res.status(400).json({ error: 'Tenant and workspace name are required' });
      return;
    }

    try {
      await knex('workspace').insert({
        tenant_id: tenantId,
        name: name.trim(),
        slug: slugify(slug || name),
        status,
      });
      res.status(201).json({ workspaces: await listWorkspaces() });
    } catch (error: any) {
      res
        .status(400)
        .json({ error: error.message || 'Unable to create workspace' });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
