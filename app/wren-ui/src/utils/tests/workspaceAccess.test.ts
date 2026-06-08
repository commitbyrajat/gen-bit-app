import { Role } from '@/utils/rbac';
import { getWorkspaceAccessScope } from '@/utils/workspaceAccess';

describe('getWorkspaceAccessScope', () => {
  it('allows platform super admins to access all workspaces', () => {
    expect(
      getWorkspaceAccessScope({
        roles: [Role.PLATFORM_SUPER_ADMIN],
      }),
    ).toEqual({ type: 'all' });
  });

  it('allows tenant roles to access workspaces in their tenant', () => {
    expect(
      getWorkspaceAccessScope({
        roles: [Role.TENANT_DATA_STEWARD],
        tenantId: 7,
        workspaceId: 12,
      }),
    ).toEqual({ type: 'tenant', tenantId: 7 });
  });

  it('limits workspace roles to their assigned workspace', () => {
    expect(
      getWorkspaceAccessScope({
        roles: [Role.WORKSPACE_VIEWER],
        tenantId: 7,
        workspaceId: 12,
      }),
    ).toEqual({ type: 'workspace', workspaceId: 12 });
  });

  it('returns no workspace access without a matching scope', () => {
    expect(
      getWorkspaceAccessScope({
        roles: [Role.BUSINESS_USER],
      }),
    ).toEqual({ type: 'none' });
  });
});
