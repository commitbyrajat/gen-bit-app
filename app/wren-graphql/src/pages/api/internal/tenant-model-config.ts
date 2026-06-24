import type { NextApiRequest, NextApiResponse } from 'next';
import { components } from '@/common';
import { isInternalServiceRequest } from '@/apollo/server/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!isInternalServiceRequest(req)) {
    res.status(401).json({ error: 'Internal service token required' });
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const tenantId = Number(req.query.tenantId);
  if (!tenantId) {
    res.status(400).json({ error: 'tenantId is required' });
    return;
  }

  const config =
    await components.aiModelRepository.getTenantRuntimeConfig(tenantId);
  res.status(200).json(config);
}
