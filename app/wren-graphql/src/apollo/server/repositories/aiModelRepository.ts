import { Knex } from 'knex';

export type AIModelType = 'CHAT' | 'COMPLETION' | 'EMBEDDING';
export type AIModelUsageType = 'COMPLETION' | 'EMBEDDING';

export interface AIModel {
  id: number;
  name: string;
  modelId: string;
  provider: string;
  baseUrl: string;
  modelType: AIModelType;
  dimension?: number | null;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TenantAIModel {
  id: number;
  tenantId: number;
  tenantName?: string;
  aiModelId: number;
  model?: AIModel;
  usageType: AIModelUsageType;
  apiKeyBase64?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TenantModelRuntimeConfig {
  completion?: {
    model: string;
    baseUrl: string;
    apiKey: string;
    provider: string;
  };
  embedding?: {
    model: string;
    baseUrl: string;
    apiKey: string;
    provider: string;
    dimension?: number | null;
  };
}

const encodeApiKey = (value: string) =>
  Buffer.from(value, 'utf8').toString('base64');

const decodeApiKey = (value: string) =>
  Buffer.from(value, 'base64').toString('utf8');

const MODEL_PREFIX = 'litellm_proxy/';

const getProviderForModelType = (modelType?: AIModelType) =>
  modelType === 'EMBEDDING' ? 'litellm_embedder' : 'litellm_llm';

const normalizeModelId = (value?: string) => {
  const normalized = (value || '').trim();
  if (!normalized) return normalized;
  return normalized.startsWith(MODEL_PREFIX)
    ? normalized
    : `${MODEL_PREFIX}${normalized.replace(/^\/+/, '')}`;
};

const mapModel = (row: any): AIModel => ({
  id: row.id,
  name: row.name,
  modelId: row.model_id,
  provider: row.provider,
  baseUrl: row.base_url,
  modelType: row.model_type,
  dimension: row.dimension,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapTenantModel = (row: any, includeApiKey = false): TenantAIModel => ({
  id: row.id,
  tenantId: row.tenant_id,
  tenantName: row.tenant_name,
  aiModelId: row.ai_model_id,
  usageType: row.usage_type,
  apiKeyBase64: includeApiKey ? row.api_key_base64 : undefined,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  model: row.model_id
    ? {
        id: row.ai_model_id,
        name: row.model_name,
        modelId: row.model_id,
        provider: row.provider,
        baseUrl: row.base_url,
        modelType: row.model_type,
        dimension: row.dimension,
        status: row.model_status,
      }
    : undefined,
});

export interface IAIModelRepository {
  listModels(): Promise<AIModel[]>;
  createModel(input: Partial<AIModel>): Promise<AIModel>;
  updateModel(id: number, input: Partial<AIModel>): Promise<AIModel>;
  deleteModel(id: number): Promise<void>;
  listTenantModels(
    tenantId?: number | null,
    includeApiKey?: boolean,
  ): Promise<TenantAIModel[]>;
  upsertTenantModel(input: {
    tenantId: number;
    aiModelId: number;
    usageType: AIModelUsageType;
    apiKey: string;
    status?: string;
  }): Promise<TenantAIModel>;
  deleteTenantModel(id: number): Promise<void>;
  getTenantRuntimeConfig(tenantId: number): Promise<TenantModelRuntimeConfig>;
  assertTenantRuntimeConfig(
    tenantId?: number | null,
  ): Promise<TenantModelRuntimeConfig>;
}

export class AIModelRepository implements IAIModelRepository {
  private knex: Knex;

  constructor(knexPg: Knex) {
    this.knex = knexPg;
  }

  public async listModels() {
    const rows = await this.knex('ai_model').orderBy('id').select('*');
    return rows.map(mapModel);
  }

  public async createModel(input: Partial<AIModel>) {
    const modelType = input.modelType;
    const modelId = normalizeModelId(input.modelId);
    await this.knex('ai_model').insert({
      name: input.name,
      model_id: modelId,
      provider: getProviderForModelType(modelType),
      base_url: input.baseUrl,
      model_type: modelType,
      dimension: modelType === 'EMBEDDING' ? input.dimension || 1536 : null,
      status: input.status || 'ACTIVE',
    });
    const row = await this.knex('ai_model')
      .where({ model_id: modelId, base_url: input.baseUrl })
      .first();
    return mapModel(row);
  }

  public async updateModel(id: number, input: Partial<AIModel>) {
    const existing = await this.knex('ai_model').where({ id }).first();
    const modelType = input.modelType || existing?.model_type;
    await this.knex('ai_model')
      .where({ id })
      .update({
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.modelId !== undefined
          ? { model_id: normalizeModelId(input.modelId) }
          : {}),
        provider: getProviderForModelType(modelType),
        ...(input.baseUrl !== undefined ? { base_url: input.baseUrl } : {}),
        ...(input.modelType !== undefined
          ? { model_type: input.modelType }
          : {}),
        ...(input.dimension !== undefined || input.modelType !== undefined
          ? {
              dimension:
                modelType === 'EMBEDDING' ? input.dimension || 1536 : null,
            }
          : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        updated_at: this.knex.fn.now(),
      });
    const row = await this.knex('ai_model').where({ id }).first();
    return mapModel(row);
  }

  public async deleteModel(id: number) {
    await this.knex('ai_model').where({ id }).delete();
  }

  public async listTenantModels(
    tenantId?: number | null,
    includeApiKey = false,
  ) {
    const query = this.knex('tenant_ai_model')
      .join('tenant', 'tenant_ai_model.tenant_id', 'tenant.id')
      .join('ai_model', 'tenant_ai_model.ai_model_id', 'ai_model.id')
      .orderBy('tenant_ai_model.id')
      .select(
        'tenant_ai_model.*',
        'tenant.name as tenant_name',
        'ai_model.name as model_name',
        'ai_model.model_id',
        'ai_model.provider',
        'ai_model.base_url',
        'ai_model.model_type',
        'ai_model.dimension',
        'ai_model.status as model_status',
      );

    if (tenantId) {
      query.where('tenant_ai_model.tenant_id', tenantId);
    }

    const rows = await query;
    return rows.map((row) => mapTenantModel(row, includeApiKey));
  }

  public async upsertTenantModel(input: {
    tenantId: number;
    aiModelId: number;
    usageType: AIModelUsageType;
    apiKey: string;
    status?: string;
  }) {
    const existing = await this.knex('tenant_ai_model')
      .where({
        tenant_id: input.tenantId,
        usage_type: input.usageType,
      })
      .first();

    const values = {
      tenant_id: input.tenantId,
      ai_model_id: input.aiModelId,
      usage_type: input.usageType,
      api_key_base64: encodeApiKey(input.apiKey),
      status: input.status || 'ACTIVE',
      updated_at: this.knex.fn.now(),
    };

    if (existing) {
      await this.knex('tenant_ai_model')
        .where({ id: existing.id })
        .update(values);
    } else {
      await this.knex('tenant_ai_model').insert(values);
    }

    const [row] = await this.listTenantModels(input.tenantId).then((rows) =>
      rows.filter((item) => item.usageType === input.usageType),
    );
    return row;
  }

  public async deleteTenantModel(id: number) {
    await this.knex('tenant_ai_model').where({ id }).delete();
  }

  public async getTenantRuntimeConfig(tenantId: number) {
    const rows = await this.knex('tenant_ai_model')
      .join('ai_model', 'tenant_ai_model.ai_model_id', 'ai_model.id')
      .where({
        'tenant_ai_model.tenant_id': tenantId,
        'tenant_ai_model.status': 'ACTIVE',
        'ai_model.status': 'ACTIVE',
      })
      .select(
        'tenant_ai_model.usage_type',
        'tenant_ai_model.api_key_base64',
        'ai_model.model_id',
        'ai_model.provider',
        'ai_model.base_url',
        'ai_model.dimension',
      );

    return rows.reduce<TenantModelRuntimeConfig>((acc, row) => {
      const config = {
        model: row.model_id,
        baseUrl: row.base_url,
        apiKey: decodeApiKey(row.api_key_base64),
        provider: row.provider,
        ...(row.usage_type === 'EMBEDDING' ? { dimension: row.dimension } : {}),
      };
      if (row.usage_type === 'EMBEDDING') {
        acc.embedding = config;
      } else {
        acc.completion = config;
      }
      return acc;
    }, {});
  }

  public async assertTenantRuntimeConfig(tenantId?: number | null) {
    if (!tenantId) {
      throw new Error(
        'Tenant is required before using AI features. Attach this workspace to a tenant and link LLM and Embedder models.',
      );
    }

    const config = await this.getTenantRuntimeConfig(tenantId);
    const missing = [
      !config.completion ? 'LLM' : null,
      !config.embedding ? 'Embedder' : null,
    ].filter(Boolean);

    if (missing.length) {
      throw new Error(
        `Link ${missing.join(' and ')} model${missing.length > 1 ? 's' : ''} to this tenant before using AI features.`,
      );
    }

    return config;
  }
}
