export enum Role {
  PLATFORM_SUPER_ADMIN = 'PLATFORM_SUPER_ADMIN',
  PLATFORM_SECURITY_ADMIN = 'PLATFORM_SECURITY_ADMIN',
  PLATFORM_OPERATIONS_ADMIN = 'PLATFORM_OPERATIONS_ADMIN',
  TENANT_ADMIN = 'TENANT_ADMIN',
  TENANT_DATA_STEWARD = 'TENANT_DATA_STEWARD',
  TENANT_DEVELOPER = 'TENANT_DEVELOPER',
  WORKSPACE_OWNER = 'WORKSPACE_OWNER',
  WORKSPACE_EDITOR = 'WORKSPACE_EDITOR',
  WORKSPACE_VIEWER = 'WORKSPACE_VIEWER',
  BUSINESS_USER = 'BUSINESS_USER',
}

export enum Permission {
  VIEW_APP = 'VIEW_APP',
  MANAGE_PLATFORM = 'MANAGE_PLATFORM',
  MANAGE_SECURITY = 'MANAGE_SECURITY',
  MANAGE_OPERATIONS = 'MANAGE_OPERATIONS',
  MANAGE_TENANT = 'MANAGE_TENANT',
  MANAGE_DATA_SOURCE = 'MANAGE_DATA_SOURCE',
  MANAGE_MODELING = 'MANAGE_MODELING',
  DEPLOY_MODEL = 'DEPLOY_MODEL',
  MANAGE_WORKSPACE = 'MANAGE_WORKSPACE',
  MANAGE_KNOWLEDGE = 'MANAGE_KNOWLEDGE',
  MANAGE_DASHBOARD = 'MANAGE_DASHBOARD',
  RUN_AI_QUERY = 'RUN_AI_QUERY',
  VIEW_API_HISTORY = 'VIEW_API_HISTORY',
}

export const ROLE_LABELS: Record<Role, string> = {
  [Role.PLATFORM_SUPER_ADMIN]: 'Platform Super Admin',
  [Role.PLATFORM_SECURITY_ADMIN]: 'Platform Security Admin',
  [Role.PLATFORM_OPERATIONS_ADMIN]: 'Platform Operations Admin',
  [Role.TENANT_ADMIN]: 'Tenant Admin',
  [Role.TENANT_DATA_STEWARD]: 'Tenant Data Steward',
  [Role.TENANT_DEVELOPER]: 'Tenant Developer',
  [Role.WORKSPACE_OWNER]: 'Workspace Owner',
  [Role.WORKSPACE_EDITOR]: 'Workspace Editor',
  [Role.WORKSPACE_VIEWER]: 'Workspace Viewer',
  [Role.BUSINESS_USER]: 'Business User',
};

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.PLATFORM_SUPER_ADMIN]: [
    Permission.VIEW_APP,
    Permission.MANAGE_PLATFORM,
    Permission.MANAGE_SECURITY,
    Permission.MANAGE_OPERATIONS,
    Permission.MANAGE_TENANT,
    Permission.MANAGE_DATA_SOURCE,
    Permission.MANAGE_MODELING,
    Permission.DEPLOY_MODEL,
    Permission.MANAGE_WORKSPACE,
    Permission.MANAGE_KNOWLEDGE,
    Permission.MANAGE_DASHBOARD,
    Permission.RUN_AI_QUERY,
    Permission.VIEW_API_HISTORY,
  ],
  [Role.PLATFORM_SECURITY_ADMIN]: [
    Permission.VIEW_APP,
    Permission.MANAGE_SECURITY,
    Permission.VIEW_API_HISTORY,
  ],
  [Role.PLATFORM_OPERATIONS_ADMIN]: [
    Permission.VIEW_APP,
    Permission.MANAGE_OPERATIONS,
  ],
  [Role.TENANT_ADMIN]: [
    Permission.VIEW_APP,
    Permission.MANAGE_TENANT,
    Permission.MANAGE_DATA_SOURCE,
    Permission.MANAGE_WORKSPACE,
    Permission.RUN_AI_QUERY,
    Permission.VIEW_API_HISTORY,
  ],
  [Role.TENANT_DATA_STEWARD]: [
    Permission.VIEW_APP,
    Permission.MANAGE_MODELING,
    Permission.DEPLOY_MODEL,
    Permission.MANAGE_KNOWLEDGE,
    Permission.RUN_AI_QUERY,
  ],
  [Role.TENANT_DEVELOPER]: [
    Permission.VIEW_APP,
    Permission.MANAGE_DATA_SOURCE,
    Permission.MANAGE_MODELING,
    Permission.DEPLOY_MODEL,
    Permission.MANAGE_KNOWLEDGE,
    Permission.MANAGE_DASHBOARD,
    Permission.RUN_AI_QUERY,
  ],
  [Role.WORKSPACE_OWNER]: [
    Permission.VIEW_APP,
    Permission.MANAGE_WORKSPACE,
    Permission.MANAGE_KNOWLEDGE,
    Permission.MANAGE_DASHBOARD,
    Permission.RUN_AI_QUERY,
    Permission.VIEW_API_HISTORY,
  ],
  [Role.WORKSPACE_EDITOR]: [
    Permission.VIEW_APP,
    Permission.MANAGE_KNOWLEDGE,
    Permission.MANAGE_DASHBOARD,
    Permission.RUN_AI_QUERY,
  ],
  [Role.WORKSPACE_VIEWER]: [Permission.VIEW_APP, Permission.RUN_AI_QUERY],
  [Role.BUSINESS_USER]: [Permission.VIEW_APP, Permission.RUN_AI_QUERY],
};

type RoleInput = Role | string | Array<Role | string>;

const normalizeRoles = (roles: RoleInput) =>
  Array.isArray(roles) ? roles : [roles];

export const hasPermission = (roles: RoleInput, permission: Permission) => {
  return normalizeRoles(roles).some((role) => {
    const permissions = ROLE_PERMISSIONS[role as Role] || [];
    return permissions.includes(permission);
  });
};

export const canAccessPath = (roles: RoleInput, pathname: string) => {
  if (pathname === '/login') return true;
  if (pathname === '/dashboard') {
    return hasPermission(roles, Permission.VIEW_APP);
  }
  if (pathname === '/ask-data') {
    return hasPermission(roles, Permission.RUN_AI_QUERY);
  }
  if (pathname === '/onboarding') {
    return (
      hasPermission(roles, Permission.MANAGE_PLATFORM) ||
      hasPermission(roles, Permission.MANAGE_TENANT) ||
      hasPermission(roles, Permission.MANAGE_WORKSPACE) ||
      hasPermission(roles, Permission.MANAGE_DATA_SOURCE)
    );
  }
  if (pathname.startsWith('/platform')) {
    return hasPermission(roles, Permission.MANAGE_PLATFORM);
  }
  if (pathname.startsWith('/tenant')) {
    return hasPermission(roles, Permission.MANAGE_TENANT);
  }
  if (pathname.startsWith('/workspace')) {
    return (
      hasPermission(roles, Permission.MANAGE_WORKSPACE) ||
      hasPermission(roles, Permission.MANAGE_DASHBOARD)
    );
  }
  if (pathname.startsWith('/governance')) {
    return (
      hasPermission(roles, Permission.MANAGE_KNOWLEDGE) ||
      hasPermission(roles, Permission.MANAGE_MODELING)
    );
  }
  if (pathname.startsWith('/setup')) {
    return hasPermission(roles, Permission.MANAGE_DATA_SOURCE);
  }
  if (pathname.startsWith('/modeling')) {
    return hasPermission(roles, Permission.MANAGE_MODELING);
  }
  if (pathname.startsWith('/knowledge')) {
    return hasPermission(roles, Permission.MANAGE_KNOWLEDGE);
  }
  if (pathname.startsWith('/api-management')) {
    return hasPermission(roles, Permission.VIEW_API_HISTORY);
  }
  if (pathname.startsWith('/home')) {
    return hasPermission(roles, Permission.RUN_AI_QUERY);
  }
  return hasPermission(roles, Permission.VIEW_APP);
};

export const getDefaultPathForRole = (roles: RoleInput) => {
  if (hasPermission(roles, Permission.VIEW_APP)) return '/dashboard';
  return '/login';
};
