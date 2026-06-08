import type { ParsedUrlQuery } from 'querystring';
import { Path } from './enum';

const getStringQueryValue = (value: string | string[] | undefined) =>
  typeof value === 'string' ? value : undefined;

export const getHomeRoute = (
  query: ParsedUrlQuery,
  threadId?: string | number,
) => ({
  pathname: Path.Home,
  query: {
    workspaceId: getStringQueryValue(query.workspaceId),
    connectionId: getStringQueryValue(query.connectionId),
    threadId: threadId === undefined ? undefined : String(threadId),
  },
});
