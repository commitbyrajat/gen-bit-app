import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button, Card, Col, Row, Space, Tag, Typography } from 'antd';
import styled from 'styled-components';
import SiderLayout from '@/components/layouts/SiderLayout';
import { useAuth } from '@/hooks/useAuth';
import { Path } from '@/utils/enum';
import { Permission, ROLE_LABELS, hasPermission } from '@/utils/rbac';

const { Paragraph, Text, Title } = Typography;

interface DashboardMetrics {
  tenants?: any[];
  users?: any[];
  workspaces?: any[];
}

const Hero = styled.div`
  background: radial-gradient(
      circle at top left,
      rgba(217, 67, 67, 0.18),
      transparent 30%
    ),
    linear-gradient(135deg, var(--gray-1), var(--gray-3));
  border: 1px solid var(--gray-4);
  border-radius: 12px;
  margin-bottom: 24px;
  padding: 28px;
`;

const ActionCard = styled(Card)`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 220px;

  .ant-card-head {
    flex: none;
  }

  .ant-card-body {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }
`;

const ActionDescription = styled(Paragraph)`
  flex: 1;
  margin-bottom: 24px;
`;

const DashboardContent = styled.div`
  margin: 0 auto;
  max-width: 1360px;
  padding: 24px;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const MetricCard = styled(Card)`
  height: 100%;

  .ant-card-body {
    padding: 24px;
  }
`;

const MetricLabel = styled.div`
  color: var(--gray-7);
  font-size: 14px;
  margin-bottom: 8px;
`;

const MetricValue = styled.div`
  color: var(--gray-9);
  font-size: 30px;
  font-weight: 600;
  line-height: 1;
`;

const Metric = ({ title, value }: { title: string; value: number }) => (
  <div>
    <MetricLabel>{title}</MetricLabel>
    <MetricValue>{value}</MetricValue>
  </div>
);

const fetchJson = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) return null;
  return response.json();
};

export default function RoleDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<DashboardMetrics>({});

  const roles = user?.roles || [];
  const canManagePlatform = hasPermission(roles, Permission.MANAGE_PLATFORM);
  const canManageTenant = hasPermission(roles, Permission.MANAGE_TENANT);
  const canManageWorkspace =
    hasPermission(roles, Permission.MANAGE_WORKSPACE) ||
    hasPermission(roles, Permission.MANAGE_DASHBOARD);
  const canManageDataSource = hasPermission(
    roles,
    Permission.MANAGE_DATA_SOURCE,
  );
  const canRunQueries = hasPermission(roles, Permission.RUN_AI_QUERY);
  const canModel = hasPermission(roles, Permission.MANAGE_MODELING);
  const canUseKnowledge = hasPermission(roles, Permission.MANAGE_KNOWLEDGE);
  const canViewApi = hasPermission(roles, Permission.VIEW_API_HISTORY);

  useEffect(() => {
    if (!user || (!canManagePlatform && !canManageTenant)) return;

    const loadMetrics = async () => {
      setLoading(true);
      try {
        const [tenantData, userData, workspaceData] = await Promise.all([
          canManagePlatform ? fetchJson('/api/admin/tenants') : null,
          canManageTenant ? fetchJson('/api/admin/users') : null,
          canManageTenant ? fetchJson('/api/admin/workspaces') : null,
        ]);
        setMetrics({
          tenants: tenantData?.tenants,
          users: userData?.users,
          workspaces: workspaceData?.workspaces,
        });
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, [canManagePlatform, canManageTenant, user]);

  const roleSummary = useMemo(() => {
    if (!user) return '';
    return user.roles.map((role) => ROLE_LABELS[role]).join(', ');
  }, [user]);

  const actions = [
    canManagePlatform && {
      title: 'Provision tenants',
      description:
        'Create business-unit tenants, track tenant status, and hand off tenant administration.',
      href: Path.PlatformTenants,
      cta: 'Manage tenants',
    },
    canManageTenant && {
      title: 'Onboard teams',
      description:
        'Create tenant workspaces for teams, products, or business domains before data-source setup.',
      href: Path.TenantWorkspaces,
      cta: 'Manage teams',
    },
    canManageTenant && {
      title: 'Bind users and roles',
      description:
        'Invite users, assign tenant/workspace scope, and attach one or more roles.',
      href: Path.TenantUsers,
      cta: 'Manage users',
    },
    (canManagePlatform ||
      canManageTenant ||
      canManageWorkspace ||
      canManageDataSource) && {
      title: 'Follow onboarding flow',
      description:
        'Use a guided sequence for tenant, team, role, and data-connection setup.',
      href: Path.OrganizationOnboarding,
      cta: 'Open flow',
    },
    canManageDataSource && {
      title: 'Connect data',
      description:
        'Manage tenant data connections and choose the current modeling/query datasource.',
      href: Path.DataSourceConnections,
      cta: 'Manage connections',
    },
    canModel && {
      title: 'Model governed data',
      description:
        'Prepare semantic models and deploy a trusted data contract for the workspace.',
      href: Path.Modeling,
      cta: 'Open modeling',
    },
    canRunQueries && {
      title: 'Ask data questions',
      description:
        'Go to the assistant workspace for natural-language analysis and saved threads.',
      href: Path.Home,
      cta: 'Ask data',
    },
    canUseKnowledge && {
      title: 'Curate knowledge',
      description:
        'Maintain instructions and verified SQL pairs used by the assistant.',
      href: Path.KnowledgeQuestionSQLPairs,
      cta: 'Open knowledge',
    },
    canViewApi && {
      title: 'Review API activity',
      description:
        'Inspect API usage and operational history available to your role.',
      href: Path.APIManagementHistory,
      cta: 'View history',
    },
  ].filter(Boolean) as {
    title: string;
    description: string;
    href: string;
    cta: string;
  }[];

  return (
    <SiderLayout loading={loading} color="gray-3">
      <DashboardContent>
        <Hero>
          <Space direction="vertical" size={8}>
            <Text className="gray-7">Role dashboard</Text>
            <Title level={3} className="mb-0">
              {user?.displayName || user?.adid}
            </Title>
            <Space wrap>
              {user?.roles.map((role) => (
                <Tag key={role}>{ROLE_LABELS[role]}</Tag>
              ))}
            </Space>
            <Paragraph className="gray-7 mb-0">
              This page is the post-login landing area. It shows only the
              tenant, workspace, data, and knowledge actions allowed by{' '}
              {roleSummary || 'the active role'}.
            </Paragraph>
          </Space>
        </Hero>

        {(canManagePlatform || canManageTenant) && (
          <Row gutter={[24, 24]} className="mb-5">
            {canManagePlatform && (
              <Col xs={24} sm={8}>
                <MetricCard>
                  <Metric
                    title="Tenants"
                    value={metrics.tenants?.length || 0}
                  />
                </MetricCard>
              </Col>
            )}
            {canManageTenant && (
              <Col xs={24} sm={8}>
                <MetricCard>
                  <Metric
                    title="Teams"
                    value={metrics.workspaces?.length || 0}
                  />
                </MetricCard>
              </Col>
            )}
            {canManageTenant && (
              <Col xs={24} sm={8}>
                <MetricCard>
                  <Metric title="Users" value={metrics.users?.length || 0} />
                </MetricCard>
              </Col>
            )}
          </Row>
        )}

        <Row gutter={[24, 24]}>
          {actions.map((action) => (
            <Col xs={24} md={12} xl={8} key={action.title}>
              <ActionCard title={action.title}>
                <ActionDescription className="gray-7">
                  {action.description}
                </ActionDescription>
                <Link href={action.href}>
                  <Button type="primary">{action.cta}</Button>
                </Link>
              </ActionCard>
            </Col>
          ))}
        </Row>
      </DashboardContent>
    </SiderLayout>
  );
}
