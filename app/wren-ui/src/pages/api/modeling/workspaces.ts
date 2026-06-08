import type { NextApiRequest, NextApiResponse } from 'next';
import { components } from '@/common';
import { requireAnyApiPermission } from '@/apollo/server/admin';
import { Permission } from '@/utils/rbac';
import {
  getWorkspaceAccessScope,
  WorkspaceAccessScope,
} from '@/utils/workspaceAccess';

const knex = components.knex;

type WorkspaceConnection = {
  id: number;
  displayName: string;
  type: string;
  status: string;
  modelCount: number;
  relationshipCount: number;
  viewCount: number;
};

type EligibleWorkspace = {
  id: number;
  name: string;
  slug: string;
  tenantId: number;
  tenantName: string;
  connection: WorkspaceConnection | null;
};

const applyWorkspaceScope = (query: any, scope: WorkspaceAccessScope) => {
  if (scope.type === 'tenant') {
    query.where('workspace.tenant_id', scope.tenantId);
  } else if (scope.type === 'workspace') {
    query.where('workspace.id', scope.workspaceId);
  }
  return query;
};

const listEligibleWorkspaces = async (
  scope: WorkspaceAccessScope,
): Promise<EligibleWorkspace[]> => {
  if (scope.type === 'none') return [];

  const workspaceQuery = knex('workspace')
    .join('tenant', 'workspace.tenant_id', 'tenant.id')
    .where('workspace.status', 'ACTIVE')
    .where('tenant.status', 'ACTIVE')
    .orderBy('tenant.name')
    .orderBy('workspace.name')
    .select(
      'workspace.id',
      'workspace.name',
      'workspace.slug',
      'workspace.tenant_id',
      'tenant.name as tenant_name',
    );
  const workspaceRows = await applyWorkspaceScope(workspaceQuery, scope);
  const workspaceIds = workspaceRows.map((workspace) => workspace.id);

  if (!workspaceIds.length) return [];

  const connectionRows = await knex('workspace_project')
    .join('project', 'workspace_project.project_id', 'project.id')
    .whereIn('workspace_project.workspace_id', workspaceIds)
    .where((builder) => {
      builder.where('project.status', 'ACTIVE').orWhereNull('project.status');
    })
    .orderBy('workspace_project.is_default', 'desc')
    .orderBy('project.updated_at', 'desc')
    .orderBy('project.id', 'desc')
    .select(
      'workspace_project.workspace_id',
      'project.id',
      'project.display_name',
      'project.type',
      'project.status',
    );

  const projectIds = connectionRows.map((connection) => connection.id);
  const [modelCounts, relationshipCounts, viewCounts] = await Promise.all([
    knex('model')
      .whereIn('project_id', projectIds)
      .groupBy('project_id')
      .select('project_id')
      .count('* as count'),
    knex('relation')
      .whereIn('project_id', projectIds)
      .groupBy('project_id')
      .select('project_id')
      .count('* as count'),
    knex('view')
      .whereIn('project_id', projectIds)
      .groupBy('project_id')
      .select('project_id')
      .count('* as count'),
  ]);
  const toCountMap = (
    rows: Array<{ project_id: number; count: string }>,
  ): Map<number, number> =>
    new Map(rows.map((row) => [row.project_id, Number(row.count)]));
  const modelCountByProject = toCountMap(modelCounts);
  const relationshipCountByProject = toCountMap(relationshipCounts);
  const viewCountByProject = toCountMap(viewCounts);

  const connectionsByWorkspace = new Map<number, WorkspaceConnection>();
  connectionRows.forEach((connection) => {
    if (!connectionsByWorkspace.has(connection.workspace_id)) {
      connectionsByWorkspace.set(connection.workspace_id, {
        id: connection.id,
        displayName: connection.display_name || `Connection ${connection.id}`,
        type: connection.type,
        status: connection.status || 'ACTIVE',
        modelCount: modelCountByProject.get(connection.id) || 0,
        relationshipCount: relationshipCountByProject.get(connection.id) || 0,
        viewCount: viewCountByProject.get(connection.id) || 0,
      });
    }
  });

  return workspaceRows.map((workspace) => ({
    id: workspace.id,
    name: workspace.name,
    slug: workspace.slug,
    tenantId: workspace.tenant_id,
    tenantName: workspace.tenant_name,
    connection: connectionsByWorkspace.get(workspace.id) || null,
  }));
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const user = await requireAnyApiPermission(knex, req, res, [
    Permission.MANAGE_MODELING,
  ]);
  if (!user) return;

  const scope = getWorkspaceAccessScope(user);
  const workspaces = await listEligibleWorkspaces(scope);

  if (req.method === 'GET') {
    res.status(200).json({ workspaces });
    return;
  }

  if (req.method === 'POST') {
    const workspaceId = Number(req.body?.workspaceId);
    const workspace = workspaces.find((item) => item.id === workspaceId);
    if (!workspace) {
      res
        .status(403)
        .json({ error: 'Workspace is not available to this user' });
      return;
    }
    if (!workspace.connection) {
      res.status(409).json({
        error: 'Workspace does not have an active data connection',
      });
      return;
    }

    await components.projectService.switchDataSource(workspace.connection.id);
    res.status(200).json({
      workspaceId: workspace.id,
      connectionId: workspace.connection.id,
    });
    return;
  }

  if (req.method === 'DELETE') {
    const workspaceId = Number(req.body?.workspaceId);
    const connectionId = Number(req.body?.connectionId);
    const workspace = workspaces.find((item) => item.id === workspaceId);
    if (!workspace || workspace.connection?.id !== connectionId) {
      res
        .status(403)
        .json({ error: 'Modeling connection is not available to this user' });
      return;
    }

    try {
      await knex.transaction(async (tx) => {
        const assignment = await tx('workspace_project')
          .where({
            workspace_id: workspaceId,
            project_id: connectionId,
          })
          .first();
        if (!assignment) {
          throw new Error(
            'Modeling connection is not assigned to this workspace',
          );
        }

        await tx('workspace_project').where({ id: assignment.id }).delete();

        const workspaceFallback = await tx('workspace_project')
          .join('project', 'workspace_project.project_id', 'project.id')
          .where('workspace_project.workspace_id', workspaceId)
          .where((builder) => {
            builder
              .where('project.status', 'ACTIVE')
              .orWhereNull('project.status');
          })
          .orderBy('workspace_project.is_default', 'desc')
          .orderBy('project.updated_at', 'desc')
          .orderBy('project.id', 'desc')
          .select('workspace_project.id')
          .first();

        if (assignment.is_default && workspaceFallback) {
          await tx('workspace_project')
            .where({ id: workspaceFallback.id })
            .update({ is_default: true });
        }

        if (assignment.is_current) {
          await tx('workspace_project').update({ is_current: false });
          const currentFallback =
            workspaceFallback ||
            (await tx('workspace_project')
              .join('project', 'workspace_project.project_id', 'project.id')
              .where((builder) => {
                builder
                  .where('project.status', 'ACTIVE')
                  .orWhereNull('project.status');
              })
              .orderBy('workspace_project.is_default', 'desc')
              .orderBy('project.updated_at', 'desc')
              .orderBy('project.id', 'desc')
              .select('workspace_project.id')
              .first());
          if (currentFallback) {
            await tx('workspace_project')
              .where({ id: currentFallback.id })
              .update({ is_current: true });
          }
        }

        const remainingAssignment = await tx('workspace_project')
          .where({ project_id: connectionId })
          .first();
        if (!remainingAssignment) {
          await tx('project')
            .where({ id: connectionId })
            .update({ status: 'INACTIVE' });
        }
      });
    } catch (error: any) {
      res.status(409).json({ error: error.message });
      return;
    }

    res.status(200).json({
      workspaces: await listEligibleWorkspaces(scope),
    });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
