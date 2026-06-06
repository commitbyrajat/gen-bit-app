import { useRouter } from 'next/router';
import Image from 'next/image';
import { useEffect, useMemo } from 'react';
import { Button, Form, Modal, message, Alert, Space, Tag } from 'antd';
import { useMutation, useQuery } from '@apollo/client';
import { makeIterable } from '@/utils/iteration';
import { DATA_SOURCES, FORM_MODE, Path } from '@/utils/enum';
import { getDataSource, getTemplates } from '@/components/pages/setup/utils';
import { FlexLoading } from '@/components/PageLoading';
import ButtonItem from '@/components/pages/setup/ButtonItem';
import {
  transformFormToProperties,
  transformPropertiesToForm,
} from '@/hooks/useSetupConnectionDataSource';
import { parseGraphQLError } from '@/utils/errorHandler';
import {
  useStartSampleDatasetMutation,
  useUpdateDataSourceMutation,
} from '@/apollo/client/graphql/dataSource.generated';
import {
  DATA_SOURCE_CONNECTIONS,
  SWITCH_DATA_SOURCE,
} from '@/apollo/client/graphql/dataSource';
import {
  DataSourceName,
  SampleDatasetName,
} from '@/apollo/client/graphql/__types__';

interface Props {
  type: DataSourceName;
  properties: Record<string, any>;
  sampleDataset: SampleDatasetName;
  refetchSettings: () => void;
  closeModal: () => void;
}

const SampleDatasetIterator = makeIterable(ButtonItem);

interface DataSourceConnection {
  id: number;
  displayName?: string;
  type: DataSourceName;
  tenantName?: string;
  workspaceName?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  isDefault: boolean;
}

const ConnectionList = ({
  activeProjectId,
  closeModal,
  refetchSettings,
}: {
  activeProjectId?: number;
  closeModal: () => void;
  refetchSettings: () => void;
}) => {
  const router = useRouter();
  const { data, loading, refetch } = useQuery(DATA_SOURCE_CONNECTIONS, {
    fetchPolicy: 'cache-and-network',
  });
  const [switchDataSource, { loading: switching }] = useMutation(
    SWITCH_DATA_SOURCE,
    {
      refetchQueries: ['GetSettings', 'DataSourceConnections'],
      onCompleted: () => {
        refetchSettings();
        message.success('Active data source switched.');
      },
      onError: (error) => message.error(error.message),
    },
  );

  const connections: DataSourceConnection[] = data?.dataSourceConnections || [];

  const createConnection = () => {
    closeModal();
    router.push(`${Path.OnboardingConnection}?mode=create`);
  };

  return (
    <div className="mb-5">
      <div className="d-flex justify-space-between align-center mb-2">
        <div className="gray-8 text-bold">Tenant data sources</div>
        <Button size="small" type="primary" onClick={createConnection}>
          New data source
        </Button>
      </div>
      {connections.length === 0 && !loading && (
        <Alert
          type="info"
          showIcon
          message="No data sources found for this tenant."
          className="mb-3"
        />
      )}
      <Space direction="vertical" size={8} className="w-100">
        {connections.map((connection) => {
          const dataSource = getDataSource(
            connection.type as unknown as DATA_SOURCES,
          );
          const enabled = connection.status !== 'INACTIVE';
          const active =
            enabled &&
            (connection.isDefault || connection.id === activeProjectId);
          return (
            <div
              key={connection.id}
              className="border border-gray-4 bg-gray-1 p-3 d-flex justify-space-between align-center"
              style={{ borderRadius: 4, opacity: enabled ? 1 : 0.68 }}
            >
              <div className="d-flex align-center">
                <Image
                  className="mr-2"
                  src={dataSource.logo}
                  alt={dataSource.label}
                  width="22"
                  height="22"
                />
                <div>
                  <div className="gray-9 text-bold">
                    {connection.displayName || `Connection ${connection.id}`}
                    {active && <Tag className="ml-2">Active</Tag>}
                    {!enabled && <Tag className="ml-2">Disabled</Tag>}
                  </div>
                  <div className="gray-7 text-sm">
                    {dataSource.label}
                    {connection.workspaceName
                      ? ` · ${connection.workspaceName}`
                      : ''}
                  </div>
                </div>
              </div>
              <Button
                size="small"
                disabled={!enabled || active}
                loading={switching}
                onClick={async () => {
                  await switchDataSource({
                    variables: { where: { id: connection.id } },
                  });
                  await refetch();
                }}
              >
                {active ? 'Active' : 'Make active'}
              </Button>
            </div>
          );
        })}
      </Space>
    </div>
  );
};

const SampleDatasetPanel = (props: Props) => {
  const router = useRouter();
  const { sampleDataset, closeModal } = props;
  const templates = getTemplates();
  const [startSampleDataset] = useStartSampleDatasetMutation({
    onError: (error) => console.error(error),
    onCompleted: () => {
      router.push(Path.Home);
      closeModal();
    },
    refetchQueries: 'active',
  });

  const onSelect = (name: SampleDatasetName) => {
    const isCurrentTemplate = sampleDataset === name;
    if (!isCurrentTemplate) {
      const template = templates.find((item) => item.value === name);
      Modal.confirm({
        title: `Are you sure you want to change to "${template.label}" dataset?`,
        okButtonProps: { danger: true },
        okText: 'Change',
        onOk: async () => {
          await startSampleDataset({ variables: { data: { name } } });
        },
      });
    }
  };

  return (
    <>
      <div className="mb-2">Change sample dataset</div>
      <div className="d-grid grid-columns-3 g-4">
        <SampleDatasetIterator
          data={templates}
          selectedTemplate={sampleDataset}
          onSelect={onSelect}
        />
      </div>
      <div className="gray-6 mt-1">
        Please be aware that choosing another sample dataset will delete all
        thread records in the Home page.
      </div>
    </>
  );
};

const DataSourcePanel = (props: Props) => {
  const { type, properties, refetchSettings, closeModal } = props;
  const { connectionId, ...editableProperties } = properties || {};

  const current = getDataSource(type as unknown as DATA_SOURCES);
  const [form] = Form.useForm();

  const [updateDataSource, { loading, error }] = useUpdateDataSourceMutation({
    onError: (error) => console.error(error),
    onCompleted: async () => {
      refetchSettings();
      message.success('Successfully update data source.');
    },
  });

  const updateError = useMemo(() => parseGraphQLError(error), [error]);

  useEffect(() => properties && reset(), [properties]);

  const reset = () => {
    form.setFieldsValue(transformPropertiesToForm(editableProperties, type));
  };

  const submit = () => {
    form
      .validateFields()
      .then((values) => {
        updateDataSource({
          variables: {
            data: { properties: transformFormToProperties(values, type) },
          },
        });
      })
      .catch((error) => {
        console.error(error);
      });
  };

  if (!type) return <FlexLoading align="center" height={150} />;

  return (
    <>
      <ConnectionList
        activeProjectId={connectionId}
        closeModal={closeModal}
        refetchSettings={refetchSettings}
      />
      <div className="d-flex align-center">
        <Image
          className="mr-2"
          src={current.logo}
          alt={current.label}
          width="24"
          height="24"
        />
        {current.label}
      </div>
      <Form form={form} layout="vertical" className="py-3 px-4">
        <current.component mode={FORM_MODE.EDIT} />

        {updateError && (
          <Alert
            message={updateError.shortMessage}
            description={updateError.message}
            type="error"
            showIcon
            className="my-6"
          />
        )}

        <div className="py-2 text-right">
          <Button className="mr-2" style={{ width: 80 }} onClick={reset}>
            Cancel
          </Button>
          <Button
            type="primary"
            style={{ width: 80 }}
            onClick={submit}
            loading={loading}
          >
            Save
          </Button>
        </div>
      </Form>
    </>
  );
};

export default function DataSourceSettings(props: Props) {
  const { sampleDataset } = props;
  const Component = sampleDataset ? SampleDatasetPanel : DataSourcePanel;
  return (
    <div className="py-3 px-4">
      <Component {...props} />
    </div>
  );
}
