import { getHomeRoute } from '@/utils/homeRoute';

describe('getHomeRoute', () => {
  it('preserves workspace context when opening a thread', () => {
    expect(
      getHomeRoute(
        {
          workspaceId: '3',
          connectionId: '31',
        },
        15,
      ),
    ).toEqual({
      pathname: '/home',
      query: {
        workspaceId: '3',
        connectionId: '31',
        threadId: '15',
      },
    });
  });

  it('removes the thread while preserving workspace context', () => {
    expect(
      getHomeRoute({
        workspaceId: '3',
        connectionId: '31',
        threadId: '15',
      }),
    ).toEqual({
      pathname: '/home',
      query: {
        workspaceId: '3',
        connectionId: '31',
        threadId: undefined,
      },
    });
  });
});
