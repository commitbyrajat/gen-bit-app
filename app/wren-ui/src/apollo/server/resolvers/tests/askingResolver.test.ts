import { AskingResolver } from '../askingResolver';
import { ApiType } from '../../repositories/apiHistoryRepository';

describe('AskingResolver API history', () => {
  it('records a created Ask Data thread in API history', async () => {
    const resolver = new AskingResolver();
    const thread = { id: 15, projectId: 31, summary: 'Question' };
    const ctx = {
      askingService: {
        createThread: jest.fn().mockResolvedValue(thread),
      },
      projectService: {
        getCurrentProject: jest.fn().mockResolvedValue({ id: 31 }),
      },
      apiHistoryRepository: {
        createOne: jest.fn().mockResolvedValue({}),
      },
      telemetry: {
        sendEvent: jest.fn(),
      },
    };

    const result = await resolver.createThread(
      null,
      {
        data: {
          question: 'How many employees are active?',
          sql: 'SELECT COUNT(*) FROM employees',
        },
      },
      ctx as any,
    );

    expect(result).toBe(thread);
    expect(ctx.apiHistoryRepository.createOne).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: 31,
        apiType: ApiType.ASK,
        threadId: '15',
        requestPayload: {
          question: 'How many employees are active?',
          source: 'ASK_DATA_UI',
        },
        responsePayload: {
          sql: 'SELECT COUNT(*) FROM employees',
        },
        statusCode: 200,
        durationMs: expect.any(Number),
      }),
    );
  });
});
