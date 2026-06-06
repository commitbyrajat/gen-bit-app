import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from 'antd';
import DatabaseOutlined from '@ant-design/icons/DatabaseOutlined';
import styled from 'styled-components';
import SiderLayout from '@/components/layouts/SiderLayout';
import { Path } from '@/utils/enum';

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

const WorkspaceCard = styled(Card)`
  height: 100%;

  .ant-card-body {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
`;

const WorkspaceDescription = styled(Paragraph)`
  flex: 1;
  margin: 16px 0 24px;
`;

export default function AskDataWorkspacePage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [openingWorkspaceId, setOpeningWorkspaceId] = useState<number | null>(
    null,
  );
  const [error, setError] = useState('');

  useEffect(() => {
    const loadWorkspaces = async () => {
      try {
        const response = await fetch('/api/ask-data/workspaces');
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

  const openAskData = async (workspace: Workspace) => {
    setOpeningWorkspaceId(workspace.id);
    try {
      const response = await fetch('/api/ask-data/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: workspace.id }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Unable to open Ask Data');
      }
      window.location.assign(
        `${Path.Home}?workspaceId=${workspace.id}&connectionId=${payload.connectionId}`,
      );
    } catch (openError: any) {
      message.error(openError.message);
      setOpeningWorkspaceId(null);
    }
  };

  return (
    <SiderLayout loading={false} color="gray-3">
      <Page>
        <Hero>
          <Text className="gray-7">Workspace selection</Text>
          <Title level={2} className="mt-2 mb-2">
            Ask Data
          </Title>
          <Paragraph className="gray-7 mb-0">
            Choose an eligible workspace. Ask Data will use that workspace's
            active mapped data connection.
          </Paragraph>
        </Hero>

        {error && (
          <Alert
            className="mb-4"
            description={error}
            message="Unable to load eligible workspaces"
            showIcon
            type="error"
          />
        )}

        {loading && (
          <div className="d-flex justify-center py-12">
            <Spin />
          </div>
        )}

        {!loading && !error && workspaces.length === 0 && (
          <Card>
            <Empty description="No eligible workspaces are available." />
          </Card>
        )}

        {!loading && workspaces.length > 0 && (
          <Row gutter={[20, 20]}>
            {workspaces.map((workspace) => {
              const hasConnection = Boolean(workspace.connection);
              return (
                <Col xs={24} md={12} xl={8} key={workspace.id}>
                  <WorkspaceCard>
                    <Space direction="vertical" size={4}>
                      <Space wrap>
                        <Title level={4} className="mb-0">
                          {workspace.name}
                        </Title>
                        <Tag>{workspace.tenantName}</Tag>
                      </Space>
                      <Text className="gray-7">{workspace.slug}</Text>
                    </Space>
                    <WorkspaceDescription className="gray-7">
                      {hasConnection
                        ? `Mapped to ${workspace.connection.displayName}.`
                        : 'No active data connection is mapped to this workspace.'}
                    </WorkspaceDescription>
                    <Button
                      block
                      disabled={!hasConnection}
                      icon={<DatabaseOutlined />}
                      loading={openingWorkspaceId === workspace.id}
                      type="primary"
                      onClick={() => openAskData(workspace)}
                    >
                      Ask Data
                    </Button>
                  </WorkspaceCard>
                </Col>
              );
            })}
          </Row>
        )}
      </Page>
    </SiderLayout>
  );
}
