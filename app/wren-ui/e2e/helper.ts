import path from 'path';
import { execFileSync } from 'child_process';
import { Page } from '@playwright/test';

const runBackendDbScript = (action: 'migrate' | 'remove' | 'reset') => {
  execFileSync('yarn', ['node', 'scripts/e2e-db.js', action], {
    cwd: path.resolve(__dirname, '../../wren-graphql'),
    stdio: 'inherit',
  });
};

export const migrateDatabase = async () => {
  runBackendDbScript('migrate');
};

export const removeDatabase = async () => {
  runBackendDbScript('remove');
};

export const resetDatabase = async () => {
  runBackendDbScript('reset');
};

export const waitForGraphQLResponse = async (
  { page }: { page: Page },
  queryKey: string,
  validateResponseData = (data: any) => data !== undefined,
) => {
  await page.waitForResponse(
    async (response) => {
      try {
        const responseBody = await response.json();
        const responseData = responseBody?.data?.[queryKey];

        return (
          response.url().includes('/api/graphql') &&
          response.status() === 200 &&
          responseBody &&
          validateResponseData(responseData)
        );
      } catch (error) {
        console.error('Error fetching response body:', error);
      }
    },
    { timeout: 100000 },
  );
};
