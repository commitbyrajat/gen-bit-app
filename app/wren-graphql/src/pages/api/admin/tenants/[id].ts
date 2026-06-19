import type { NextApiRequest, NextApiResponse } from 'next';
import { components } from '@/common';
import { requireAnyApiPermission, slugify } from '@/apollo/server/admin';
import { Permission, Role } from '@/utils/rbac';

const knex = components.knex;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const user = await requireAnyApiPermission(knex, req, res, [
    Permission.MANAGE_PLATFORM,
  ]);
  if (!user) return;

  if (!user.roles.includes(Role.PLATFORM_SUPER_ADMIN)) {
    res
      .status(403)
      .json({ error: 'Only Platform Super Admin can manage tenants' });
    return;
  }

  const id = Number(req.query.id);
  if (!id) {
    res.status(400).json({ error: 'Tenant id is required' });
    return;
  }

  if (req.method === 'PATCH') {
    const { name, slug, status } = req.body || {};
    const updates: Record<string, any> = { updated_at: knex.fn.now() };
    if (name) updates.name = name.trim();
    if (slug) updates.slug = slugify(slug);
    if (status) updates.status = status;

    await knex('tenant').where({ id }).update(updates);
    res.status(200).json({ ok: true });
    return;
  }

  if (req.method === 'DELETE') {
    await knex('tenant').where({ id }).update({
      status: 'DELETED',
      updated_at: knex.fn.now(),
    });
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
