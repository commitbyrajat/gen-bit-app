import Link from 'next/link';
import { Button, Card, Col, Row, Space, Steps, Tag, Typography } from 'antd';
import styled from 'styled-components';
import SiderLayout from '@/components/layouts/SiderLayout';
import { useAuth } from '@/hooks/useAuth';
import { Path } from '@/utils/enum';
import { Permission, ROLE_LABELS, hasPermission } from '@/utils/rbac';

const { Paragraph, Text, Title } = Typography;

const HeaderPanel = styled.div`
  background: linear-gradient(
      135deg,
      rgba(31, 51, 78, 0.08),
      rgba(217, 67, 67, 0.08)
    ),
    var(--gray-1);
  border: 1px solid var(--gray-4);
  border-radius: 12px;
  margin-bottom: 24px;
  padding: 28px;
`;

const Content = styled.div`
  margin: 0 auto;
  max-width: 1360px;
  padding: 24px;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const StepCard = styled(Card)<{ $available: boolean }>`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 220px;
  opacity: ${(props) => (props.$available ? 1 : 0.55)};

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

const StepDescription = styled(Paragraph)`
  flex: 1;
  margin-bottom: 24px;
`;

export default function OrganizationOnboardingPage() {
  const { user } = useAuth();
  const roles = user?.roles || [];
  const canManagePlatform = hasPermission(roles, Permission.MANAGE_PLATFORM);
  const canManageTenant = hasPermission(roles, Permission.MANAGE_TENANT);
  const canManageWorkspace = hasPermission(roles, Permission.MANAGE_WORKSPACE);
  const canManageDataSource = hasPermission(
    roles,
    Permission.MANAGE_DATA_SOURCE,
  );
  const canModel = hasPermission(roles, Permission.MANAGE_MODELING);
  const canUseKnowledge = hasPermission(roles, Permission.MANAGE_KNOWLEDGE);

  const steps = [
    {
      title: 'Tenant',
      description:
        'Create or activate the tenant boundary for the business unit.',
      available: canManagePlatform,
      href: Path.PlatformTenants,
      cta: 'Provision tenant',
      restricted: 'Platform Super Admin',
    },
    {
      title: 'Teams',
      description:
        'Create tenant workspaces for teams, products, or analytics domains.',
      available: canManageTenant,
      href: Path.TenantWorkspaces,
      cta: 'Create teams',
      restricted: 'Tenant Admin',
    },
    {
      title: 'Users and roles',
      description:
        'Bind users to tenant/workspace scope and assign tenant or workspace roles.',
      available: canManageTenant,
      href: Path.TenantUsers,
      cta: 'Bind roles',
      restricted: 'Tenant Admin',
    },
    {
      title: 'Workspace governance',
      description:
        'Review workspace-level requests and approvals when your role owns them.',
      available: canManageWorkspace,
      href: Path.WorkspaceApprovals,
      cta: 'Review workspace',
      restricted: 'Workspace Owner',
    },
    {
      title: 'Data connection',
      description:
        'Connect the workspace data source only after tenant and team scope are ready.',
      available: canManageDataSource,
      href: Path.OnboardingConnection,
      cta: 'Connect data',
      restricted: 'Tenant Admin or Tenant Developer',
    },
    {
      title: 'Model and knowledge',
      description:
        'Prepare semantic models, instructions, and verified SQL knowledge.',
      available: canModel || canUseKnowledge,
      href: canModel ? Path.Modeling : Path.KnowledgeQuestionSQLPairs,
      cta: 'Prepare knowledge',
      restricted: 'Tenant Developer or Data Steward',
    },
  ];

  const availableSteps = steps.filter((step) => step.available);

  return (
    <SiderLayout color="gray-3">
      <Content>
        <HeaderPanel>
          <Space direction="vertical" size={8}>
            <Text className="gray-7">Dedicated onboarding flow</Text>
            <Title level={3} className="mb-0">
              Tenant, team, role, and connection setup
            </Title>
            <Space wrap>
              {user?.roles.map((role) => (
                <Tag key={role}>{ROLE_LABELS[role]}</Tag>
              ))}
            </Space>
            <Paragraph className="gray-7 mb-0">
              Follow these steps in order. Each action is enabled only when the
              logged-in role has the required scope.
            </Paragraph>
          </Space>
        </HeaderPanel>

        <Card className="mb-5">
          <Steps current={Math.max(availableSteps.length - 1, 0)}>
            {steps.map((step) => (
              <Steps.Step
                key={step.title}
                title={step.title}
                status={step.available ? 'process' : 'wait'}
              />
            ))}
          </Steps>
        </Card>

        <Row gutter={[24, 24]}>
          {steps.map((step) => (
            <Col xs={24} md={12} xl={8} key={step.title}>
              <StepCard
                $available={step.available}
                title={
                  <Space>
                    {step.title}
                    {!step.available && <Tag>Restricted</Tag>}
                  </Space>
                }
              >
                <StepDescription className="gray-7">
                  {step.description}
                </StepDescription>
                {step.available ? (
                  <Link href={step.href}>
                    <Button type="primary">{step.cta}</Button>
                  </Link>
                ) : (
                  <Button disabled>{step.restricted}</Button>
                )}
              </StepCard>
            </Col>
          ))}
        </Row>
      </Content>
    </SiderLayout>
  );
}
