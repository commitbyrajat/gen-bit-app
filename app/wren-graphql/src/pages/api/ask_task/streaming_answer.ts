import type { NextApiRequest, NextApiResponse } from 'next';
import { components } from '@/common';
import { ThreadResponseAnswerStatus } from '@/apollo/server/services/askingService';
import { TelemetryEvent } from '@/apollo/server/telemetry/telemetry';
import { requireApiPermission } from '@/apollo/server/auth';
import { Permission } from '@/utils/rbac';

const { wrenAIAdaptor, askingService, telemetry } = components;

class ContentMap {
  private contentMap: { [key: string]: string } = {};

  // Method to append (concatenate) content to the map
  public appendContent(key: string, content: string) {
    if (!this.contentMap[key]) {
      this.contentMap[key] = '';
    }
    this.contentMap[key] += content;
  }

  // Method to get content from the map
  public getContent(key: string): string | undefined {
    return this.contentMap[key];
  }

  // Method to remove content from the map
  public remove(key: string) {
    delete this.contentMap[key];
  }
}

const contentMap = new ContentMap();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
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

  const { responseId } = req.query;
  if (!responseId) {
    res.status(400).json({ error: 'responseId is required' });
    return;
  }
  try {
    const response = await askingService.getResponse(Number(responseId));
    if (!response) {
      throw new Error(`Thread response ${responseId} not found`);
    }

    // check response status
    if (
      response.answerDetail?.status !== ThreadResponseAnswerStatus.STREAMING
    ) {
      throw new Error(
        `Thread response ${responseId} is not in streaming status`,
      );
    }

    const queryId = response.answerDetail?.queryId;
    if (!queryId) {
      throw new Error(`Thread response ${responseId} does not have queryId`);
    }

    const stream = await wrenAIAdaptor.streamTextBasedAnswer(queryId);
    let buffer = '';
    let streamCompleted = false;

    const appendMessagesFromBuffer = (flush = false) => {
      const events = buffer.split(/\n\n/);
      buffer = flush ? '' : events.pop() || '';

      const completeEvents = events;
      completeEvents.forEach((event) => {
        const data = event
          .split('\n')
          .filter((line) => line.startsWith('data:'))
          .map((line) => line.replace(/^data:\s?/, ''))
          .join('\n')
          .trim();

        if (!data) return;

        try {
          const payload = JSON.parse(data);
          if (payload?.message) {
            contentMap.appendContent(queryId, payload.message);
          }
        } catch {
          console.log(`not able to parse streaming answer event: ${data}`);
        }
      });
    };

    stream.on('data', (chunk) => {
      // pass the chunk directly to the client
      const chunkString = chunk.toString('utf-8');
      buffer += chunkString;
      appendMessagesFromBuffer();
      res.write(chunk);
    });

    stream.on('end', () => {
      appendMessagesFromBuffer(true);
      streamCompleted = true;
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
      askingService
        .changeThreadResponseAnswerDetailStatus(
          Number(responseId),
          ThreadResponseAnswerStatus.FINISHED,
          contentMap.getContent(queryId),
        )
        .then(() => {
          console.log(
            'Thread response answer detail status updated to FINISHED',
          );
          contentMap.remove(queryId);
          telemetry.sendEvent(TelemetryEvent.HOME_ANSWER_QUESTION, {
            question: response.question,
          });
        })
        .catch((error) => {
          console.error(
            'Failed to update thread response answer detail status',
            error,
          );
          contentMap.remove(queryId);
          telemetry.sendEvent(
            TelemetryEvent.HOME_ANSWER_QUESTION,
            {
              question: response.question,
              error: error,
            },
            null,
            false,
          );
        });
    });

    // destroy the stream if the client closes the connection
    req.on('close', () => {
      if (streamCompleted) return;
      stream.destroy();
      askingService
        .changeThreadResponseAnswerDetailStatus(
          Number(responseId),
          ThreadResponseAnswerStatus.INTERRUPTED,
          contentMap.getContent(queryId),
        )
        .then(() => {
          console.log(
            'Thread response answer detail status updated to INTERRUPTED',
          );
          contentMap.remove(queryId);
          telemetry.sendEvent(TelemetryEvent.HOME_ANSWER_QUESTION_INTERRUPTED, {
            question: response.question,
          });
        })
        .catch((error) => {
          console.error(
            'Failed to update thread response answer detail status',
            error,
          );
          contentMap.remove(queryId);
          telemetry.sendEvent(
            TelemetryEvent.HOME_ANSWER_QUESTION_INTERRUPTED,
            {
              question: response.question,
              error: error,
            },
            null,
            false,
          );
        });
    });
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
}
