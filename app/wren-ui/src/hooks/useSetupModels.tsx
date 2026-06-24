import { useState } from 'react';
import { Path, SETUP } from '@/utils/enum';
import { useRouter } from 'next/router';
import {
  useListDataSourceTablesQuery,
  useSaveTablesMutation,
} from '@/apollo/client/graphql/dataSource.generated';
import { appPath } from '@/utils/url';

export default function useSetupModels() {
  const [stepKey] = useState(SETUP.SELECT_MODELS);

  const router = useRouter();
  const rawConnectionId = router.query.connectionId;
  const connectionId =
    typeof rawConnectionId === 'string' && /^\d+$/.test(rawConnectionId)
      ? Number(rawConnectionId)
      : undefined;

  const { data, loading: fetching } = useListDataSourceTablesQuery({
    variables: { connectionId },
    skip: !router.isReady,
    fetchPolicy: 'no-cache',
    onError: (error) => console.error(error),
  });

  // Handle errors via try/catch blocks rather than onError callback
  const [saveTablesMutation, { loading: submitting }] = useSaveTablesMutation();

  const submitModels = async (tables: string[]) => {
    try {
      await saveTablesMutation({
        variables: {
          data: { tables, connectionId },
        },
      });
      const query = connectionId ? `?connectionId=${connectionId}` : '';
      const path = `${Path.OnboardingRelationships}${query}`;
      router.push(path, appPath(path));
    } catch (error) {
      console.error(error);
    }
  };

  const onBack = () => {
    const path = connectionId
      ? Path.DataSourceConnections
      : Path.OnboardingConnection;
    router.push(path, appPath(path));
  };

  const onNext = (data: { selectedTables: string[] }) => {
    submitModels(data.selectedTables);
  };

  return {
    submitting,
    fetching,
    stepKey,
    onBack,
    onNext,
    tables: data?.listDataSourceTables || [],
  };
}
