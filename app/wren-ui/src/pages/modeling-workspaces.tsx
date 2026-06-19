import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Empty,
  Popconfirm,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import ApartmentOutlined from '@ant-design/icons/ApartmentOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import styled from 'styled-components';
import SiderLayout from '@/components/layouts/SiderLayout';
import { Path } from '@/utils/enum';
import { apiPath, appPath } from '@/utils/url';

const { Paragraph, Text, Title } = Typography;

type Workspace = {
  id: number;
  name: string;
  slug: string;
  tenantId: number;
  tenantName: string;
  connection: {
    id: number;
    displayName: string;
    type: string;
    status: string;
    modelCount: number;
    relationshipCount: number;
    viewCount: number;
  } | null;
};

const Page = styled.div`
  margin: 0 auto;
  max-width: 1180px;
  padding: 32px 24px;

  @media (max-width: 768px) {
    padding: 24px 16px;
  }
`;

const Hero = styled.div`
  background: linear-gradient(135deg, var(--gray-1), var(--gray-3));
  border: 1px solid var(--gray-4);
  border-radius: 12px;
  margin-bottom: 24px;
  padding: 28px;
`;

const TableCard = styled(Card)`
  .ant-card-body {
    padding: 0;
  }
`;

export default function ModelingWorkspacePage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [openingWorkspaceId, setOpeningWorkspaceId] = useState<number | null>(
    null,
  );
  const [removingWorkspaceId, setRemovingWorkspaceId] = useState<number | null>(
    null,
  );
  const [error, setError] = useState('');

  useEffect(() => {
    const loadWorkspaces = async () => {
      try {
        const response = await fetch(apiPath('/api/modeling/workspaces'));
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || 'Unable to load workspaces');
        }
        setWorkspaces(payload.workspaces || []);
      } catch (loadError: any) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    };

    loadWorkspaces();
  }, []);

  const openModeling = async (workspace: Workspace) => {
    setOpeningWorkspaceId(workspace.id);
    try {
      const response = await fetch(apiPath('/api/modeling/workspaces'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: workspace.id }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Unable to open modeling');
      }
      window.location.assign(
        appPath(
          `${Path.Modeling}?workspaceId=${workspace.id}&connectionId=${payload.connectionId}`,
        ),
      );
    } catch (openError: any) {
      message.error(openError.message);
      setOpeningWorkspaceId(null);
    }
  };

  const removeModeling = async (workspace: Workspace) => {
    if (!workspace.connection) return;

    setRemovingWorkspaceId(workspace.id);
    try {
      const response = await fetch(apiPath('/api/modeling/workspaces'), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: workspace.id,
          connectionId: workspace.connection.id,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(
          payload.error || 'Unable to remove modeling connection',
        );
      }
      setWorkspaces(payload.workspaces || []);
      message.success('Modeling connection removed from the workspace.');
    } catch (removeError: any) {
      message.error(removeError.message);
    } finally {
      setRemovingWorkspaceId(null);
    }
  };

  const columns: ColumnsType<Workspace> = [
    {
      title: 'Workspace',
      key: 'workspace',
      fixed: 'left',
      render: (_, workspace) => (
        <Space direction="vertical" size={0}>
          <Text strong>{workspace.name}</Text>
          <Text className="gray-7">{workspace.slug}</Text>
        </Space>
      ),
    },
    {
      title: 'Tenant',
      dataIndex: 'tenantName',
      key: 'tenantName',
    },
    {
      title: 'Connection',
      key: 'connection',
      render: (_, workspace) =>
        workspace.connection ? (
          <Space direction="vertical" size={0}>
            <Text>{workspace.connection.displayName}</Text>
            <Text className="gray-7">ID: {workspace.connection.id}</Text>
          </Space>
        ) : (
          <Text className="gray-7">Not configured</Text>
        ),
    },
    {
      title: 'Source',
      key: 'source',
      render: (_, workspace) =>
        workspace.connection ? <Tag>{workspace.connection.type}</Tag> : '-',
    },
    {
      title: 'Modeled Tables',
      key: 'modelCount',
      align: 'right',
      render: (_, workspace) => workspace.connection?.modelCount ?? 0,
    },
    {
      title: 'Relationships',
      key: 'relationshipCount',
      align: 'right',
      render: (_, workspace) => workspace.connection?.relationshipCount ?? 0,
    },
    {
      title: 'Views',
      key: 'viewCount',
      align: 'right',
      render: (_, workspace) => workspace.connection?.viewCount ?? 0,
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, workspace) => (
        <Tag color={workspace.connection ? 'green' : 'default'}>
          {workspace.connection?.status || 'NO CONNECTION'}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      render: (_, workspace) => (
        <Space>
          <Button
            disabled={!workspace.connection}
            icon={<ApartmentOutlined />}
            loading={openingWorkspaceId === workspace.id}
            type="primary"
            onClick={() => openModeling(workspace)}
          >
            Edit
          </Button>
          <Popconfirm
            cancelText="Cancel"
            disabled={!workspace.connection}
            okButtonProps={{ danger: true }}
            okText="Remove"
            title="Remove modeling from this workspace? The connection and models will be preserved."
            onConfirm={() => removeModeling(workspace)}
          >
            <Button
              danger
              disabled={!workspace.connection}
              icon={<DeleteOutlined />}
              loading={removingWorkspaceId === workspace.id}
            >
              Remove
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <SiderLayout loading={false} color="gray-3">
      <Page>
        <Hero>
          <Text className="gray-7">Workspace selection</Text>
          <Title level={2} className="mt-2 mb-2">
            Modeling
          </Title>
          <Paragraph className="gray-7 mb-0">
            Choose an accessible workspace to edit its semantic models,
            relationships, metadata, and views.
          </Paragraph>
        </Hero>

        {error && (
          <Alert
            className="mb-4"
            description={error}
            message="Unable to load accessible workspaces"
            showIcon
            type="error"
          />
        )}

        {!loading && !error && workspaces.length === 0 && (
          <Card>
            <Empty description="No accessible workspaces are available." />
          </Card>
        )}

        {(loading || workspaces.length > 0) && (
          <TableCard>
            <Table<Workspace>
              columns={columns}
              dataSource={workspaces}
              loading={loading}
              pagination={{ pageSize: 10, showSizeChanger: true }}
              rowKey="id"
              scroll={{ x: 1100 }}
            />
          </TableCard>
        )}
      </Page>
    </SiderLayout>
  );
}
