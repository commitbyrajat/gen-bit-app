import Link from 'next/link';
import type { ReactNode } from 'react';
import { Button, Space } from 'antd';
import styled from 'styled-components';
import { useAuth } from '@/hooks/useAuth';
import { Path } from '@/utils/enum';
import { Permission, hasPermission } from '@/utils/rbac';
import { appPath } from '@/utils/url';

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

const NavLink = ({ href, children }: { href: Path; children: ReactNode }) => (
  <Link style={linkStyle} href={href} as={appPath(href)}>
    {children}
  </Link>
);

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
  return (
    <Wrapper>
      <SectionTitle>Role workspace</SectionTitle>
      <Space direction="vertical" size={6} className="w-100">
        <NavButton type="text" block>
          <NavLink href={Path.Dashboard}>Dashboard</NavLink>
        </NavButton>
        {canManagePlatform && (
          <NavButton type="text" block>
            <NavLink href={Path.PlatformTenants}>Tenants</NavLink>
          </NavButton>
        )}
        {canManageTenant && (
          <NavButton type="text" block>
            <NavLink href={Path.TenantUsers}>Users and roles</NavLink>
          </NavButton>
        )}
        {canManageTenant && (
          <NavButton type="text" block>
            <NavLink href={Path.TenantWorkspaces}>Teams</NavLink>
          </NavButton>
        )}
        {canManageTenant && (
          <NavButton type="text" block>
            <NavLink href={Path.TenantModels}>AI models</NavLink>
          </NavButton>
        )}
        {canManageWorkspace && (
          <NavButton type="text" block>
            <NavLink href={Path.WorkspaceApprovals}>
              Workspace approvals
            </NavLink>
          </NavButton>
        )}
        {canManageDataSource && (
          <NavButton type="text" block>
            <NavLink href={Path.DataSourceConnections}>
              Data connections
            </NavLink>
          </NavButton>
        )}
        {canRunQueries && (
          <NavButton type="text" block>
            <NavLink href={Path.AskData}>Ask data</NavLink>
          </NavButton>
        )}
        {canModel && (
          <NavButton type="text" block>
            <NavLink href={Path.ModelingWorkspaces}>Modeling</NavLink>
          </NavButton>
        )}
        {canUseKnowledge && (
          <NavButton type="text" block>
            <NavLink href={Path.KnowledgeQuestionSQLPairs}>Knowledge</NavLink>
          </NavButton>
        )}
        {canViewApi && (
          <NavButton type="text" block>
            <NavLink href={Path.APIManagementHistory}>Audit</NavLink>
          </NavButton>
        )}
      </Space>
    </Wrapper>
  );
}
