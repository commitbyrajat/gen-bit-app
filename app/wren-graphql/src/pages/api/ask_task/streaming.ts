import type { NextApiRequest, NextApiResponse } from 'next';
import { components } from '@/common';
import { requireApiPermission } from '@/apollo/server/auth';
import { Permission } from '@/utils/rbac';

const { wrenAIAdaptor } = components;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const user = await requireApiPermission(
    components.knex,
    req,
    res,
    Permission.RUN_AI_QUERY,
  );
  if (!user) return;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const { queryId } = req.query;
  try {
    const stream = await wrenAIAdaptor.getAskStreamingResult(queryId as string);

    stream.on('data', (chunk) => {
      // pass the chunk directly to the client
      res.write(chunk);
    });

    stream.on('end', () => {
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    });

    // destroy the stream if the client closes the connection
    req.on('close', () => {
      stream.destroy();
    });
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
}
