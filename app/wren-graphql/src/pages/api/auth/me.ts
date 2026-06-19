import type { NextApiRequest, NextApiResponse } from 'next';
import { components } from '@/common';
import { getAuthenticatedUser } from '@/apollo/server/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const user = await getAuthenticatedUser(components.knex, req);
  if (!user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  res.status(200).json({ user });
}
