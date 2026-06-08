import type { NextApiRequest, NextApiResponse } from 'next';
import { getClearSessionCookie } from '@/apollo/server/auth';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  res.setHeader('Set-Cookie', getClearSessionCookie());
  res.status(200).json({ ok: true });
}
