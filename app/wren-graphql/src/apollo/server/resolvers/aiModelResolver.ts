import { GraphQLError } from 'graphql';
import { IContext } from '../types';
import { Permission, hasPermission } from '@/utils/rbac';

const requireTenantModelAccess = (ctx: IContext) => {
  const user = ctx.auth?.user;
  if (!user) {
    throw new GraphQLError('Authentication required', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
  if (
    !hasPermission(user.roles, Permission.MANAGE_PLATFORM) &&
    !hasPermission(user.roles, Permission.MANAGE_TENANT)
  ) {
    throw new GraphQLError('Forbidden', {
      extensions: { code: 'FORBIDDEN' },
    });
  }
  return user;
};

const assertTenantScope = (ctx: IContext, tenantId?: number | null) => {
  const user = requireTenantModelAccess(ctx);
  const isPlatform = hasPermission(user.roles, Permission.MANAGE_PLATFORM);
  if (!isPlatform && (!tenantId || tenantId !== user.tenantId)) {
    throw new GraphQLError('Cannot manage model keys outside your tenant', {
      extensions: { code: 'FORBIDDEN' },
    });
  }
};

export class AIModelResolver {
  constructor() {
    this.aiModels = this.aiModels.bind(this);
    this.tenantAIModels = this.tenantAIModels.bind(this);
    this.createAIModel = this.createAIModel.bind(this);
    this.updateAIModel = this.updateAIModel.bind(this);
    this.deleteAIModel = this.deleteAIModel.bind(this);
    this.upsertTenantAIModel = this.upsertTenantAIModel.bind(this);
    this.deleteTenantAIModel = this.deleteTenantAIModel.bind(this);
  }

  public async aiModels(_root: any, _args: any, ctx: IContext) {
    requireTenantModelAccess(ctx);
    return ctx.aiModelRepository.listModels();
  }

  public async tenantAIModels(
    _root: any,
    args: { tenantId?: number },
    ctx: IContext,
  ) {
    const user = requireTenantModelAccess(ctx);
    const tenantId = hasPermission(user.roles, Permission.MANAGE_PLATFORM)
      ? args.tenantId
      : user.tenantId;
    return ctx.aiModelRepository.listTenantModels(tenantId);
  }

  public async createAIModel(_root: any, args: any, ctx: IContext) {
    const user = requireTenantModelAccess(ctx);
    if (!hasPermission(user.roles, Permission.MANAGE_PLATFORM)) {
      throw new GraphQLError('Only platform admins can create proxy models', {
        extensions: { code: 'FORBIDDEN' },
      });
    }
    return ctx.aiModelRepository.createModel(args.data);
  }

  public async updateAIModel(
    _root: any,
    args: { where: { id: number }; data: any },
    ctx: IContext,
  ) {
    const user = requireTenantModelAccess(ctx);
    if (!hasPermission(user.roles, Permission.MANAGE_PLATFORM)) {
      throw new GraphQLError('Only platform admins can update proxy models', {
        extensions: { code: 'FORBIDDEN' },
      });
    }
    const attachedTenantIds = await ctx.aiModelRepository
      .listTenantModels()
      .then((rows) =>
        rows
          .filter((row) => row.model?.id === args.where.id)
          .map((row) => row.tenantId),
      );
    const model = await ctx.aiModelRepository.updateModel(
      args.where.id,
      args.data,
    );
    await Promise.all(
      [...new Set(attachedTenantIds)].map((tenantId) =>
        ctx.wrenAIAdaptor.invalidateTenantModelCache(tenantId),
      ),
    );
    return model;
  }

  public async deleteAIModel(
    _root: any,
    args: { where: { id: number } },
    ctx: IContext,
  ) {
    const user = requireTenantModelAccess(ctx);
    if (!hasPermission(user.roles, Permission.MANAGE_PLATFORM)) {
      throw new GraphQLError('Only platform admins can delete proxy models', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    const attachedBindings = await ctx.aiModelRepository
      .listTenantModels()
      .then((rows) => rows.filter((row) => row.model?.id === args.where.id));
    if (attachedBindings.length) {
      throw new GraphQLError(
        'Model is attached to a tenant. De-link the model from tenant before removing it.',
        {
          extensions: { code: 'BAD_USER_INPUT' },
        },
      );
    }

    await ctx.aiModelRepository.deleteModel(args.where.id);
    return true;
  }

  public async upsertTenantAIModel(_root: any, args: any, ctx: IContext) {
    assertTenantScope(ctx, args.data.tenantId);
    const binding = await ctx.aiModelRepository.upsertTenantModel(args.data);
    await ctx.wrenAIAdaptor.invalidateTenantModelCache(args.data.tenantId);
    return binding;
  }

  public async deleteTenantAIModel(
    _root: any,
    args: { where: { id: number } },
    ctx: IContext,
  ) {
    const [binding] = await ctx.aiModelRepository
      .listTenantModels()
      .then((rows) => rows.filter((row) => row.id === args.where.id));
    assertTenantScope(ctx, binding?.tenantId);
    await ctx.aiModelRepository.deleteTenantModel(args.where.id);
    await ctx.wrenAIAdaptor.invalidateTenantModelCache(binding?.tenantId);
    return true;
  }
}
