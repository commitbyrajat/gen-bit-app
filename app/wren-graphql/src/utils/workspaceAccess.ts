import { Role } from './rbac';

type WorkspaceUser = {
  roles: Array<Role | string>;
  tenantId?: number | null;
  workspaceId?: number | null;
};

export type WorkspaceAccessScope =
  | { type: 'all' }
  | { type: 'tenant'; tenantId: number }
  | { type: 'workspace'; workspaceId: number }
  | { type: 'none' };

const TENANT_SCOPED_ROLES = new Set<Role>([
  Role.TENANT_ADMIN,
  Role.TENANT_DATA_STEWARD,
  Role.TENANT_DEVELOPER,
]);

export const getWorkspaceAccessScope = (
  user: WorkspaceUser,
): WorkspaceAccessScope => {
  if (user.roles.includes(Role.PLATFORM_SUPER_ADMIN)) {
    return { type: 'all' };
  }

  if (
    user.tenantId &&
    user.roles.some((role) => TENANT_SCOPED_ROLES.has(role as Role))
  ) {
    return { type: 'tenant', tenantId: user.tenantId };
  }

  if (user.workspaceId) {
    return { type: 'workspace', workspaceId: user.workspaceId };
  }

  return { type: 'none' };
};
