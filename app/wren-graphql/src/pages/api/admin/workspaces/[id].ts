import type { NextApiRequest, NextApiResponse } from 'next';
import { components } from '@/common';
import { requireAnyApiPermission, slugify } from '@/apollo/server/admin';
import { Permission } from '@/utils/rbac';

const knex = components.knex;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const user = await requireAnyApiPermission(knex, req, res, [
    Permission.MANAGE_TENANT,
    Permission.MANAGE_WORKSPACE,
  ]);
  if (!user) return;

  const id = Number(req.query.id);
  if (!id) {
    res.status(400).json({ error: 'Workspace id is required' });
    return;
  }

  if (req.method === 'PATCH') {
    const { name, slug, status } = req.body || {};
    const updates: Record<string, any> = { updated_at: knex.fn.now() };
    if (name) updates.name = name.trim();
    if (slug) updates.slug = slugify(slug);
    if (status) updates.status = status;

    await knex('workspace').where({ id }).update(updates);
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
