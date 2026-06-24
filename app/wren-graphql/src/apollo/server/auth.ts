import crypto from 'crypto';
import { Knex } from 'knex';
import { NextApiRequest, NextApiResponse } from 'next';
import { GraphQLError } from 'graphql';
import { compare } from 'bcryptjs';
import { Permission, Role, hasPermission } from '@/utils/rbac';
import { getConfig } from './config';
import type { IContext } from './types';

const AUTH_COOKIE_NAME = 'atlas_session';
const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;
const INTERNAL_API_TOKEN_HEADER = 'x-wren-ui-internal-api-token';

export interface AuthenticatedUser {
  id: number;
  adid: string;
  displayName: string;
  role: Role | null;
  roles: Role[];
  tenantId?: number | null;
  workspaceId?: number | null;
  status: string;
}

type StoredUser = AuthenticatedUser & {
  passwordHash: string;
};

const parseCookieHeader = (cookieHeader?: string) => {
  return (cookieHeader || '')
    .split(';')
    .reduce<Record<string, string>>((acc, item) => {
      const [key, ...value] = item.trim().split('=');
      if (key) acc[key] = decodeURIComponent(value.join('='));
      return acc;
    }, {});
};

const encodeBase64Url = (value: string) =>
  Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

const decodeBase64Url = (value: string) =>
  Buffer.from(value.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString(
    'utf8',
  );

const getSessionSecret = () => {
  const config = getConfig();
  return `${config.encryptionPassword}:${config.encryptionSalt}`;
};

const sign = (payload: string) =>
  encodeBase64Url(
    crypto
      .createHmac('sha256', getSessionSecret())
      .update(payload)
      .digest('hex'),
  );

const getHeaderValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const constantTimeEquals = (left: string, right: string) => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    crypto.timingSafeEqual(leftBuffer, rightBuffer)
  );
};

export const isInternalServiceRequest = (req: NextApiRequest) => {
  const expectedToken = process.env.WREN_UI_INTERNAL_API_TOKEN;
  if (!expectedToken) return false;

  const headerToken = getHeaderValue(req.headers[INTERNAL_API_TOKEN_HEADER]);
  const authorization = getHeaderValue(req.headers.authorization);
  const bearerToken = authorization?.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : undefined;
  const providedToken = headerToken || bearerToken;

  return providedToken
    ? constantTimeEquals(providedToken, expectedToken)
    : false;
};

const getUserRoles = async (knex: Knex, userId: number): Promise<Role[]> => {
  const rows = await knex('app_user_role')
    .join('app_role', 'app_user_role.app_role_id', 'app_role.id')
    .where({
      'app_user_role.app_user_id': userId,
      'app_role.status': 'ACTIVE',
    })
    .orderBy('app_role.id')
    .select('app_role.name');

  return rows.map((row) => row.name as Role);
};

const mapUser = (row: any, roles: Role[]): StoredUser | null => {
  if (!row) return null;
  return {
    id: row.id,
    adid: row.adid,
    displayName: row.display_name,
    passwordHash: row.password_hash,
    role: roles[0] || null,
    roles,
    tenantId: row.tenant_id,
    workspaceId: row.workspace_id,
    status: row.status,
  };
};

export const toPublicUser = (user: StoredUser): AuthenticatedUser => ({
  id: user.id,
  adid: user.adid,
  displayName: user.displayName,
  role: user.role,
  roles: user.roles,
  tenantId: user.tenantId,
  workspaceId: user.workspaceId,
  status: user.status,
});

export const createSessionToken = (user: AuthenticatedUser) => {
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = encodeBase64Url(
    JSON.stringify({
      userId: user.id,
      adid: user.adid,
      expiresAt,
    }),
  );
  return `${payload}.${sign(payload)}`;
};

export const getSessionCookie = (user: AuthenticatedUser) => {
  const token = createSessionToken(user);
  return [
    `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${SESSION_MAX_AGE_SECONDS}`,
    process.env.NODE_ENV === 'production' ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ');
};

export const getClearSessionCookie = () =>
  `${AUTH_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;

export const authenticateUser = async (
  knex: Knex,
  adid: string,
  password: string,
) => {
  const row = await knex('app_user')
    .where({ adid: adid.trim().toUpperCase(), status: 'ACTIVE' })
    .first();
  const roles = row ? await getUserRoles(knex, row.id) : [];
  const user = mapUser(row, roles);
  if (!user) return null;
  const passwordMatches = await compare(password, user.passwordHash);
  if (!passwordMatches) return null;
  await knex('app_user').where({ id: user.id }).update({
    last_login_at: knex.fn.now(),
    updated_at: knex.fn.now(),
  });
  return toPublicUser(user);
};

export const getAuthenticatedUser = async (knex: Knex, req: NextApiRequest) => {
  const cookies = parseCookieHeader(req.headers.cookie);
  const token = cookies[AUTH_COOKIE_NAME];
  if (!token) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature || sign(payload) !== signature) return null;
  try {
    const decoded = JSON.parse(decodeBase64Url(payload));
    if (!decoded.userId || decoded.expiresAt < Date.now()) return null;
    const row = await knex('app_user')
      .where({ id: decoded.userId, status: 'ACTIVE' })
      .first();
    const roles = row ? await getUserRoles(knex, row.id) : [];
    const user = mapUser(row, roles);
    return user ? toPublicUser(user) : null;
  } catch {
    return null;
  }
};

export const requireApiPermission = async (
  knex: Knex,
  req: NextApiRequest,
  res: NextApiResponse,
  permission: Permission,
) => {
  const user = await getAuthenticatedUser(knex, req);
  if (!user) {
    res.status(401).json({ error: 'Authentication required' });
    return null;
  }
  if (!hasPermission(user.roles, permission)) {
    res.status(403).json({ error: 'Forbidden' });
    return null;
  }
  return user;
};

const mutationPermissions: Record<string, Permission> = {
  saveDataSource: Permission.MANAGE_DATA_SOURCE,
  startSampleDataset: Permission.MANAGE_DATA_SOURCE,
  updateDataSource: Permission.MANAGE_DATA_SOURCE,
  resetCurrentProject: Permission.MANAGE_DATA_SOURCE,
  switchDataSource: Permission.MANAGE_DATA_SOURCE,
  updateDataSourceConnectionStatus: Permission.MANAGE_DATA_SOURCE,
  deleteDataSourceConnection: Permission.MANAGE_DATA_SOURCE,
  saveTables: Permission.MANAGE_MODELING,
  saveRelations: Permission.MANAGE_MODELING,
  createModel: Permission.MANAGE_MODELING,
  updateModel: Permission.MANAGE_MODELING,
  deleteModel: Permission.MANAGE_MODELING,
  updateModelMetadata: Permission.MANAGE_MODELING,
  createCalculatedField: Permission.MANAGE_MODELING,
  updateCalculatedField: Permission.MANAGE_MODELING,
  deleteCalculatedField: Permission.MANAGE_MODELING,
  createRelation: Permission.MANAGE_MODELING,
  updateRelation: Permission.MANAGE_MODELING,
  deleteRelation: Permission.MANAGE_MODELING,
  createView: Permission.MANAGE_MODELING,
  deleteView: Permission.MANAGE_MODELING,
  updateViewMetadata: Permission.MANAGE_MODELING,
  deploy: Permission.DEPLOY_MODEL,
  createDashboardItem: Permission.MANAGE_DASHBOARD,
  updateDashboardItem: Permission.MANAGE_DASHBOARD,
  deleteDashboardItem: Permission.MANAGE_DASHBOARD,
  updateDashboardItemLayouts: Permission.MANAGE_DASHBOARD,
  setDashboardSchedule: Permission.MANAGE_DASHBOARD,
  createSqlPair: Permission.MANAGE_KNOWLEDGE,
  updateSqlPair: Permission.MANAGE_KNOWLEDGE,
  deleteSqlPair: Permission.MANAGE_KNOWLEDGE,
  createInstruction: Permission.MANAGE_KNOWLEDGE,
  updateInstruction: Permission.MANAGE_KNOWLEDGE,
  deleteInstruction: Permission.MANAGE_KNOWLEDGE,
  saveLearningRecord: Permission.MANAGE_KNOWLEDGE,
  createAIModel: Permission.MANAGE_PLATFORM,
  updateAIModel: Permission.MANAGE_PLATFORM,
  deleteAIModel: Permission.MANAGE_PLATFORM,
  upsertTenantAIModel: Permission.MANAGE_TENANT,
  deleteTenantAIModel: Permission.MANAGE_TENANT,
};

const queryPermissions: Record<string, Permission> = {
  apiHistory: Permission.VIEW_API_HISTORY,
  apiHistoryDetail: Permission.VIEW_API_HISTORY,
  settings: Permission.VIEW_APP,
  dataSourceConnections: Permission.MANAGE_DATA_SOURCE,
  aiModels: Permission.MANAGE_TENANT,
  tenantAIModels: Permission.MANAGE_TENANT,
};

export const authorizeGraphQLOperation = (
  operation: string,
  operationType: 'Query' | 'Mutation',
  ctx: IContext,
) => {
  if (
    ctx.auth?.internalService &&
    operationType === 'Mutation' &&
    operation === 'previewSql'
  ) {
    return;
  }

  const user = ctx.auth?.user;
  if (!user) {
    throw new GraphQLError('Authentication required', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
  const requiredPermission =
    operationType === 'Mutation'
      ? mutationPermissions[operation] || Permission.RUN_AI_QUERY
      : queryPermissions[operation] || Permission.VIEW_APP;

  if (!hasPermission(user.roles, requiredPermission)) {
    throw new GraphQLError('Forbidden', {
      extensions: { code: 'FORBIDDEN', permission: requiredPermission },
    });
  }
};
