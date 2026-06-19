import type { NextApiRequest, NextApiResponse } from 'next';
import { components } from '@/common';
import { requireAnyApiPermission, slugify } from '@/apollo/server/admin';
import { Permission } from '@/utils/rbac';

const knex = components.knex;

const listTenants = async () => {
  const tenants = await knex('tenant')
    .leftJoin('workspace', 'tenant.id', 'workspace.tenant_id')
    .leftJoin('app_user', 'tenant.id', 'app_user.tenant_id')
    .groupBy('tenant.id')
    .orderBy('tenant.id')
    .select(
      'tenant.id',
      'tenant.name',
      'tenant.slug',
      'tenant.status',
      'tenant.created_at',
      knex.raw('count(distinct workspace.id) as workspace_count'),
      knex.raw('count(distinct app_user.id) as user_count'),
    );

  return tenants.map((tenant) => ({
    ...tenant,
    workspaceCount: Number(tenant.workspace_count || 0),
    userCount: Number(tenant.user_count || 0),
  }));
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const user = await requireAnyApiPermission(knex, req, res, [
    Permission.MANAGE_PLATFORM,
    Permission.MANAGE_TENANT,
  ]);
  if (!user) return;

  if (req.method === 'GET') {
    res.status(200).json({ tenants: await listTenants() });
    return;
  }

  if (req.method === 'POST') {
    if (!user.roles.includes('PLATFORM_SUPER_ADMIN' as any)) {
      res
        .status(403)
        .json({ error: 'Only Platform Super Admin can create tenants' });
      return;
    }

    const { name, slug, status = 'ACTIVE' } = req.body || {};
    if (!name) {
      res.status(400).json({ error: 'Tenant name is required' });
      return;
    }

    const tenantSlug = slugify(slug || name);
    if (!tenantSlug) {
      res.status(400).json({ error: 'Tenant slug is required' });
      return;
    }

    try {
      await knex('tenant').insert({
        name: name.trim(),
        slug: tenantSlug,
        status,
      });
      res.status(201).json({ tenants: await listTenants() });
    } catch (error: any) {
      res
        .status(400)
        .json({ error: error.message || 'Unable to create tenant' });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
