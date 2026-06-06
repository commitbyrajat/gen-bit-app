import { useRouter } from 'next/router';
import { Button, Layout, Space } from 'antd';
import styled from 'styled-components';
import LogoBar from '@/components/LogoBar';
import { Path } from '@/utils/enum';
import Deploy from '@/components/deploy/Deploy';
import { useAuth } from '@/hooks/useAuth';
import { Permission, ROLE_LABELS, hasPermission } from '@/utils/rbac';

const { Header } = Layout;

const StyledButton = styled(Button)<{ $isHighlight: boolean }>`
  background: ${(props) =>
    props.$isHighlight ? 'var(--atlas-red)' : 'transparent'};
  font-weight: ${(props) => (props.$isHighlight ? '700' : 'normal')};
  border: none;
  color: var(--gray-1);

  &:hover,
  &:focus {
    background: ${(props) =>
      props.$isHighlight ? 'var(--atlas-red)' : 'rgba(255, 255, 255, 0.12)'};
    color: var(--gray-1);
  }
`;

const StyledHeader = styled(Header)`
  height: 48px;
  border-bottom: 1px solid var(--atlas-blue-dark);
  background: var(--atlas-blue);
  padding: 10px 16px;
`;

export default function HeaderBar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { pathname } = router;
  const showNav = !pathname.startsWith(Path.Onboarding);
  const isModeling = pathname.startsWith(Path.Modeling);
  const canManagePlatform =
    user && hasPermission(user.roles, Permission.MANAGE_PLATFORM);
  const canManageTenant =
    user && hasPermission(user.roles, Permission.MANAGE_TENANT);
  const canManageWorkspace =
    user &&
    (hasPermission(user.roles, Permission.MANAGE_WORKSPACE) ||
      hasPermission(user.roles, Permission.MANAGE_DASHBOARD));
  const canGovern =
    user &&
    (hasPermission(user.roles, Permission.MANAGE_KNOWLEDGE) ||
      hasPermission(user.roles, Permission.MANAGE_MODELING));
  const canUseKnowledge =
    user && hasPermission(user.roles, Permission.MANAGE_KNOWLEDGE);
  const canViewApi =
    user && hasPermission(user.roles, Permission.VIEW_API_HISTORY);
  const canDeploy = user && hasPermission(user.roles, Permission.DEPLOY_MODEL);
  const roleTitle = user
    ? user.roles.map((role) => ROLE_LABELS[role]).join(', ')
    : undefined;

  return (
    <StyledHeader>
      <div
        className="d-flex justify-space-between align-center"
        style={{ marginTop: -2 }}
      >
        <Space size={[48, 0]}>
          <LogoBar />
          {showNav && (
            <Space size={[16, 0]}>
              <StyledButton
                shape="round"
                size="small"
                $isHighlight={pathname === Path.Dashboard}
                onClick={() => router.push(Path.Dashboard)}
              >
                Dashboard
              </StyledButton>
              {canManagePlatform && (
                <StyledButton
                  shape="round"
                  size="small"
                  $isHighlight={pathname.startsWith('/platform')}
                  onClick={() => router.push(Path.PlatformTenants)}
                >
                  Tenant
                </StyledButton>
              )}
              {canManageTenant && (
                <StyledButton
                  shape="round"
                  size="small"
                  $isHighlight={pathname.startsWith('/tenant')}
                  onClick={() => router.push(Path.TenantUsers)}
                >
                  Membership
                </StyledButton>
              )}
              {canManageWorkspace && (
                <StyledButton
                  shape="round"
                  size="small"
                  $isHighlight={pathname.startsWith('/workspace')}
                  onClick={() => router.push(Path.WorkspaceApprovals)}
                >
                  Workspace
                </StyledButton>
              )}
              {canGovern && (
                <StyledButton
                  shape="round"
                  size="small"
                  $isHighlight={pathname.startsWith('/governance')}
                  onClick={() => router.push(Path.GovernanceGlossary)}
                >
                  Governance
                </StyledButton>
              )}
              {canUseKnowledge && (
                <StyledButton
                  shape="round"
                  size="small"
                  $isHighlight={pathname.startsWith(Path.Knowledge)}
                  onClick={() => router.push(Path.KnowledgeQuestionSQLPairs)}
                >
                  Knowledge
                </StyledButton>
              )}
              {canViewApi && (
                <StyledButton
                  shape="round"
                  size="small"
                  $isHighlight={pathname.startsWith(Path.APIManagement)}
                  onClick={() => router.push(Path.APIManagementHistory)}
                >
                  Audit
                </StyledButton>
              )}
            </Space>
          )}
        </Space>
        <Space size={[16, 0]}>
          {isModeling && canDeploy && <Deploy />}
          {user && (
            <StyledButton
              shape="round"
              size="small"
              $isHighlight={false}
              title={roleTitle}
              onClick={logout}
            >
              {user.adid}
            </StyledButton>
          )}
        </Space>
      </div>
    </StyledHeader>
  );
}
