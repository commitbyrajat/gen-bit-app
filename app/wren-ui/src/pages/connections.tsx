import { useRouter } from 'next/router';
import Image from 'next/image';
import DatabaseOutlined from '@ant-design/icons/DatabaseOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import {
  Alert,
  Button,
  Modal,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/lib/table';
import { useMutation, useQuery } from '@apollo/client';
import styled from 'styled-components';
import SiderLayout from '@/components/layouts/SiderLayout';
import { getDataSource } from '@/components/pages/setup/utils';
import { DATA_SOURCES, Path } from '@/utils/enum';
import {
  DATA_SOURCE_CONNECTIONS,
  DELETE_DATA_SOURCE_CONNECTION,
  SWITCH_DATA_SOURCE,
  UPDATE_DATA_SOURCE_CONNECTION_STATUS,
} from '@/apollo/client/graphql/dataSource';
import { DataSourceName } from '@/apollo/client/graphql/__types__';

const { Text, Title } = Typography;

interface DataSourceConnection {
  id: number;
  displayName?: string;
  type: DataSourceName;
  tenantName?: string;
  workspaceName?: string;
  status: 'ACTIVE' | 'INACTIVE';
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const Page = styled.div`
  margin: 0 auto;
  max-width: 1360px;
  padding: 32px 24px 24px;

  @media (max-width: 768px) {
    padding: 24px 16px 16px;
  }
`;

const Hero = styled.div`
  margin-bottom: 24px;
`;

const TableSurface = styled.div`
  background: var(--gray-1);
  border: 1px solid var(--gray-4);
  border-radius: 8px;
  overflow: hidden;

  .ant-table {
    background: transparent;
  }

  .ant-table-container {
    overflow: auto;
  }

  .ant-table-thead > tr > th {
    background: var(--gray-2);
    color: var(--gray-8);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0;
    text-transform: uppercase;
  }

  .ant-table-tbody > tr > td {
    border-color: var(--gray-4);
    vertical-align: middle;
  }

  .ant-table-tbody > tr:hover > td {
    background: var(--gray-2);
  }

  .ant-table-cell {
    overflow-wrap: normal;
    word-break: normal;
  }
`;

const ScopeCell = styled.div`
  min-width: 0;

  .scope-value {
    display: block;
    max-width: 220px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const UpdatedCell = styled.span`
  display: block;
  min-width: 150px;
  white-space: nowrap;
`;

const ActionsCell = styled.div`
  min-width: 360px;
`;

const getConnectionLabel = (connection: DataSourceConnection) =>
  connection.displayName || `Connection ${connection.id}`;

const formatDateTime = (value: unknown) => {
  if (value === undefined || value === null || value === '') return '-';
  if (typeof value !== 'string' && typeof value !== 'number') return '-';

  const numericValue =
    typeof value === 'number'
      ? value
      : /^\d+$/.test(value.trim())
        ? Number(value)
        : null;
  const timestamp =
    numericValue === null
      ? value
      : numericValue < 1_000_000_000_000
        ? numericValue * 1000
        : numericValue;

  try {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return '-';

    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  } catch {
    return '-';
  }
};

export default function DataSourceConnectionsPage() {
  const router = useRouter();
  const { data, loading, refetch, error } = useQuery(DATA_SOURCE_CONNECTIONS, {
    fetchPolicy: 'cache-and-network',
  });
  const [switchDataSource, { loading: switching }] = useMutation(
    SWITCH_DATA_SOURCE,
    {
      onCompleted: () => {
        message.success('Current data connection updated.');
        refetch();
      },
      onError: (error) => message.error(error.message),
    },
  );
  const [updateStatus, { loading: updatingStatus }] = useMutation(
    UPDATE_DATA_SOURCE_CONNECTION_STATUS,
    {
      onCompleted: () => {
        message.success('Connection status updated.');
        refetch();
      },
      onError: (error) => message.error(error.message),
    },
  );
  const [deleteConnection, { loading: deleting }] = useMutation(
    DELETE_DATA_SOURCE_CONNECTION,
    {
      onCompleted: () => {
        message.success('Data connection removed.');
        refetch();
      },
      onError: (error) => message.error(error.message),
    },
  );

  const connections: DataSourceConnection[] = data?.dataSourceConnections || [];

  const createConnection = () => {
    router.push(`${Path.OnboardingConnection}?mode=create`);
  };

  const updateConnectionStatus = (
    connection: DataSourceConnection,
    status: 'ACTIVE' | 'INACTIVE',
  ) => {
    const disabling = status === 'INACTIVE';
    Modal.confirm({
      title: `${disabling ? 'Disable' : 'Enable'} ${getConnectionLabel(
        connection,
      )}?`,
      content: disabling
        ? 'Disabled connections are removed from the current modeling and query selection logic.'
        : 'Enabled connections can be selected as the current source for modeling and queries.',
      okText: disabling ? 'Disable' : 'Enable',
      okButtonProps: { danger: disabling },
      onOk: async () => {
        await updateStatus({
          variables: {
            where: { id: connection.id },
            data: { status },
          },
        });
      },
    });
  };

  const openModeling = async (connection: DataSourceConnection) => {
    const goToModeling = async () => {
      if (!connection.isDefault) {
        await switchDataSource({
          variables: { where: { id: connection.id } },
        });
      }
      router.push(`${Path.Modeling}?connectionId=${connection.id}`);
    };

    if (connection.status === 'INACTIVE') {
      Modal.confirm({
        title: `Enable ${getConnectionLabel(connection)} for modelling?`,
        content:
          'This connection must be enabled before it can be used for modelling.',
        okText: 'Enable and open',
        onOk: async () => {
          await updateStatus({
            variables: {
              where: { id: connection.id },
              data: { status: 'ACTIVE' },
            },
          });
          await goToModeling();
        },
      });
      return;
    }

    await goToModeling();
  };

  const configureModels = (connection: DataSourceConnection) => {
    router.push(`${Path.OnboardingModels}?connectionId=${connection.id}`);
  };

  const removeConnection = (connection: DataSourceConnection) => {
    Modal.confirm({
      title: `Remove ${getConnectionLabel(connection)}?`,
      content:
        'This permanently removes the connection, its models, views, deployments, and query history. This action cannot be undone.',
      okText: 'Remove connection',
      okButtonProps: { danger: true },
      onOk: async () => {
        await deleteConnection({
          variables: { where: { id: connection.id } },
        });
      },
    });
  };

  const columns: ColumnsType<DataSourceConnection> = [
    {
      title: 'Connection',
      dataIndex: 'displayName',
      key: 'connection',
      width: 260,
      render: (_, connection) => {
        const dataSource = getDataSource(
          connection.type as unknown as DATA_SOURCES,
        );
        return (
          <Space align="center" size={12}>
            <Image
              src={dataSource.logo}
              alt={dataSource.label}
              width="32"
              height="32"
            />
            <Space direction="vertical" size={0}>
              <Text strong>{getConnectionLabel(connection)}</Text>
              <Text className="gray-7">ID {connection.id}</Text>
            </Space>
          </Space>
        );
      },
    },
    {
      title: 'Source',
      dataIndex: 'type',
      key: 'type',
      width: 140,
      render: (_, connection) => {
        const dataSource = getDataSource(
          connection.type as unknown as DATA_SOURCES,
        );
        return <Tag>{dataSource.label}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (_, connection) => {
        const enabled = connection.status !== 'INACTIVE';
        return (
          <Space wrap size={4}>
            <Tag color={enabled ? 'green' : 'default'}>
              {enabled ? 'Enabled' : 'Disabled'}
            </Tag>
            {connection.isDefault && enabled && <Tag color="blue">Current</Tag>}
          </Space>
        );
      },
    },
    {
      title: 'Scope',
      key: 'scope',
      width: 240,
      render: (_, connection) => (
        <ScopeCell>
          <Text className="scope-value" strong>
            {connection.workspaceName || 'Unassigned workspace'}
          </Text>
          <Text className="scope-value gray-7">
            {connection.tenantName || 'Unassigned tenant'}
          </Text>
        </ScopeCell>
      ),
    },
    {
      title: 'Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 190,
      render: (value) => <UpdatedCell>{formatDateTime(value)}</UpdatedCell>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 390,
      render: (_, connection) => {
        const enabled = connection.status !== 'INACTIVE';
        return (
          <ActionsCell>
            <Space wrap size={8}>
              <Tooltip title="Open modelling for this connection">
                <Button
                  icon={<DatabaseOutlined />}
                  loading={switching || updatingStatus}
                  type="primary"
                  onClick={() => openModeling(connection)}
                >
                  Modelling
                </Button>
              </Tooltip>
              <Button
                disabled={!enabled}
                onClick={() => configureModels(connection)}
              >
                Setup models
              </Button>
              <Button
                disabled={!enabled || connection.isDefault}
                loading={switching}
                onClick={() =>
                  switchDataSource({
                    variables: { where: { id: connection.id } },
                  })
                }
              >
                {connection.isDefault ? 'Current' : 'Make Current'}
              </Button>
              {enabled ? (
                <Button
                  danger
                  loading={updatingStatus}
                  onClick={() => updateConnectionStatus(connection, 'INACTIVE')}
                >
                  Disable
                </Button>
              ) : (
                <Button
                  loading={updatingStatus}
                  onClick={() => updateConnectionStatus(connection, 'ACTIVE')}
                >
                  Enable
                </Button>
              )}
              <Tooltip title="Permanently remove this connection">
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  loading={deleting}
                  onClick={() => removeConnection(connection)}
                >
                  Remove
                </Button>
              </Tooltip>
            </Space>
          </ActionsCell>
        );
      },
    },
  ];

  return (
    <SiderLayout loading={loading} color="gray-3">
      <Page>
        <Hero>
          <Space
            align="start"
            className="w-100"
            direction="horizontal"
            style={{ justifyContent: 'space-between' }}
          >
            <Space direction="vertical" size={8}>
              <Text className="gray-7">Datasource administration</Text>
              <Title level={3} className="mb-0">
                Connections
              </Title>
              <Text className="gray-7">
                Review tenant connections, enable or disable existing sources,
                and choose the current source used by modeling and query flows.
              </Text>
            </Space>
            <Button
              icon={<PlusOutlined />}
              type="primary"
              onClick={createConnection}
            >
              Create Connection
            </Button>
          </Space>
        </Hero>

        {error && (
          <Alert
            type="error"
            showIcon
            className="mb-4"
            message="Unable to load data connections"
            description={error.message}
          />
        )}

        {!loading && connections.length === 0 && (
          <Alert
            type="info"
            showIcon
            className="mb-4"
            message="No data connections found"
            description="Create a connection to start a new modeling space for a tenant workspace."
          />
        )}

        <TableSurface>
          <Table<DataSourceConnection>
            columns={columns}
            dataSource={connections}
            pagination={false}
            rowKey="id"
            scroll={{ x: 1370 }}
            tableLayout="fixed"
          />
        </TableSurface>
      </Page>
    </SiderLayout>
  );
}
