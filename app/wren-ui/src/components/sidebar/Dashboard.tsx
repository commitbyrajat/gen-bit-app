import Link from 'next/link';
import { Button, Space } from 'antd';
import styled from 'styled-components';
import { useAuth } from '@/hooks/useAuth';
import { Path } from '@/utils/enum';
import { Permission, hasPermission } from '@/utils/rbac';

const Wrapper = styled.div`
  padding: 18px 16px;
`;

const SectionTitle = styled.div`
  color: var(--gray-7);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  margin-bottom: 8px;
  text-transform: uppercase;
`;

const NavButton = styled(Button)`
  border-radius: 6px;
  justify-content: flex-start;
  height: 34px;
  padding-left: 10px;
  padding-right: 10px;
  text-align: left;

  > span {
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const linkStyle = {
  color: 'inherit',
  display: 'block',
  width: '100%',
};

export default function DashboardSidebar() {
  const { user } = useAuth();
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
  const canOnboard =
    canManagePlatform ||
    canManageTenant ||
    hasPermission(roles, Permission.MANAGE_WORKSPACE) ||
    canManageDataSource;

  return (
    <Wrapper>
      <SectionTitle>Role workspace</SectionTitle>
      <Space direction="vertical" size={6} className="w-100">
        <NavButton type="text" block>
          <Link style={linkStyle} href={Path.Dashboard}>
            Dashboard
          </Link>
        </NavButton>
        {canOnboard && (
          <NavButton type="text" block>
            <Link style={linkStyle} href={Path.OrganizationOnboarding}>
              Onboarding flow
            </Link>
          </NavButton>
        )}
        {canManagePlatform && (
          <NavButton type="text" block>
            <Link style={linkStyle} href={Path.PlatformTenants}>
              Tenants
            </Link>
          </NavButton>
        )}
        {canManageTenant && (
          <NavButton type="text" block>
            <Link style={linkStyle} href={Path.TenantUsers}>
              Users and roles
            </Link>
          </NavButton>
        )}
        {canManageTenant && (
          <NavButton type="text" block>
            <Link style={linkStyle} href={Path.TenantWorkspaces}>
              Teams
            </Link>
          </NavButton>
        )}
        {canManageWorkspace && (
          <NavButton type="text" block>
            <Link style={linkStyle} href={Path.WorkspaceApprovals}>
              Workspace approvals
            </Link>
          </NavButton>
        )}
        {canManageDataSource && (
          <NavButton type="text" block>
            <Link style={linkStyle} href={Path.DataSourceConnections}>
              Data connections
            </Link>
          </NavButton>
        )}
        {canRunQueries && (
          <NavButton type="text" block>
            <Link style={linkStyle} href={Path.AskData}>
              Ask data
            </Link>
          </NavButton>
        )}
        {canModel && (
          <NavButton type="text" block>
            <Link style={linkStyle} href={Path.ModelingWorkspaces}>
              Modeling
            </Link>
          </NavButton>
        )}
        {canUseKnowledge && (
          <NavButton type="text" block>
            <Link style={linkStyle} href={Path.KnowledgeQuestionSQLPairs}>
              Knowledge
            </Link>
          </NavButton>
        )}
        {canViewApi && (
          <NavButton type="text" block>
            <Link style={linkStyle} href={Path.APIManagementHistory}>
              API history
            </Link>
          </NavButton>
        )}
      </Space>
    </Wrapper>
  );
}
