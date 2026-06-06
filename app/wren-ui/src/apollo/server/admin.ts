import { Knex } from 'knex';
import { NextApiRequest, NextApiResponse } from 'next';
import { getAuthenticatedUser } from './auth';
import { Permission, hasPermission } from '@/utils/rbac';

export const requireAnyApiPermission = async (
  knex: Knex,
  req: NextApiRequest,
  res: NextApiResponse,
  permissions: Permission[],
) => {
  const user = await getAuthenticatedUser(knex, req);
  if (!user) {
    res.status(401).json({ error: 'Authentication required' });
    return null;
  }

  if (
    !permissions.some((permission) => hasPermission(user.roles, permission))
  ) {
    res.status(403).json({ error: 'Forbidden' });
    return null;
  }

  return user;
};

export const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
