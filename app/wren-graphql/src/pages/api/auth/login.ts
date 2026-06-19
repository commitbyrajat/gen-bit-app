import type { NextApiRequest, NextApiResponse } from 'next';
import { components } from '@/common';
import { authenticateUser, getSessionCookie } from '@/apollo/server/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { adid, password } = req.body || {};
  if (!adid || !password) {
    res.status(400).json({ error: 'ADID and password are required' });
    return;
  }

  const user = await authenticateUser(components.knex, adid, password);
  if (!user) {
    res.status(401).json({ error: 'Invalid ADID or password' });
    return;
  }

  res.setHeader('Set-Cookie', getSessionCookie(user));
  res.status(200).json({ user });
}
