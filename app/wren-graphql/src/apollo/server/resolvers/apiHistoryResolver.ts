import { ApiType, ApiHistory } from '@server/repositories/apiHistoryRepository';
import { IContext } from '@server/types';

export interface ApiHistoryFilter {
  apiType?: ApiType;
  statusCode?: number;
  threadId?: string;
  projectId?: number;
  startDate?: string;
  endDate?: string;
}

export interface ApiHistoryPagination {
  offset: number;
  limit: number;
}

/**
 * Sanitize response payload to remove large data fields
 * This prevents excessive data transfer when displaying API history
 * @param payload The response payload to sanitize
 * @param apiType The type of API that generated this response
 */
const sanitizeResponsePayload = (payload: any, apiType?: ApiType): any => {
  if (!payload) return payload;

  const sanitized = { ...payload };

  // Handle specifically RUN_SQL responses that contain large record sets
  if (apiType === ApiType.RUN_SQL) {
    // Remove records array but keep metadata about how many records were returned
    if (sanitized.records && Array.isArray(sanitized.records)) {
      const recordCount = sanitized.records.length;
      sanitized.records = [`${recordCount} records omitted`];
    }
  }

  // Handle specifically GENERATE_VEGA_CHART responses that contain large data values
  if (apiType === ApiType.GENERATE_VEGA_CHART) {
    // Remove vegaSpec.data.values array but keep the structure
    if (
      sanitized.vegaSpec?.data?.values &&
      Array.isArray(sanitized.vegaSpec.data.values)
    ) {
      const dataCount = sanitized.vegaSpec.data.values.length;
      sanitized.vegaSpec.data.values = [`${dataCount} data points omitted`];
    }
  }

  return sanitized;
};

const maskSecret = (value?: string | null) => {
  if (!value) return null;
  const secret = String(value);
  const prefix = secret.startsWith('sk-proj-')
    ? 'sk-proj-'
    : secret.slice(0, 6);
  const suffix = secret.slice(-6);
  const maskLength = Math.max(secret.length - prefix.length - suffix.length, 8);
  return `${prefix}${'*'.repeat(maskLength)}${suffix}`;
};

const sanitizeHeaders = (headers?: Record<string, any> | null) => {
  if (!headers) return null;
  const sensitiveHeaders = new Set([
    'authorization',
    'cookie',
    'x-api-key',
    'x-wren-api-key',
    'x-wren-ui-internal-api-token',
  ]);

  return Object.entries(headers).reduce<Record<string, any>>(
    (acc, [key, value]) => {
      acc[key] = sensitiveHeaders.has(key.toLowerCase())
        ? maskSecret(Array.isArray(value) ? value.join(',') : String(value))
        : value;
      return acc;
    },
    {},
  );
};

const getAdid = (apiHistory: ApiHistory, ctx: IContext) => {
  const headers = apiHistory.headers || {};
  return (
    apiHistory.requestPayload?.adid ||
    apiHistory.requestPayload?.userAdid ||
    headers['x-adid'] ||
    headers['x-user-adid'] ||
    ctx.auth?.user?.adid ||
    null
  );
};

const formatAttachedModel = (binding?: any) => {
  if (!binding?.model) return null;
  const apiKey = binding.apiKeyBase64
    ? Buffer.from(binding.apiKeyBase64, 'base64').toString('utf8')
    : null;
  return {
    name: binding.model.name,
    model: binding.model.modelId,
    provider: binding.model.provider,
    baseUrl: binding.model.baseUrl,
    status: binding.status,
    apiKey: maskSecret(apiKey),
  };
};

export class ApiHistoryResolver {
  constructor() {
    this.getApiHistory = this.getApiHistory.bind(this);
    this.getApiHistoryDetail = this.getApiHistoryDetail.bind(this);
  }

  /**
   * Get API history with filtering and pagination
   */
  public async getApiHistory(
    _root: unknown,
    args: {
      filter?: ApiHistoryFilter;
      pagination: ApiHistoryPagination;
    },
    ctx: IContext,
  ) {
    const { filter, pagination } = args;
    const { offset, limit } = pagination;

    // Build filter criteria
    const filterCriteria: Partial<ApiHistory> = {};

    if (filter) {
      if (filter.apiType) {
        filterCriteria.apiType = filter.apiType;
      }

      if (filter.statusCode) {
        filterCriteria.statusCode = filter.statusCode;
      }

      if (filter.threadId) {
        filterCriteria.threadId = filter.threadId;
      }

      if (filter.projectId) {
        filterCriteria.projectId = filter.projectId;
      }
    }

    // Handle date filtering
    const dateFilter: { startDate?: Date; endDate?: Date } = {};
    if (filter?.startDate) {
      dateFilter.startDate = new Date(filter.startDate);
    }
    if (filter?.endDate) {
      dateFilter.endDate = new Date(filter.endDate);
    }

    // Get total count for pagination info
    const total = await ctx.apiHistoryRepository.count(
      filterCriteria,
      dateFilter,
    );

    if (total === 0 || total <= offset) {
      return {
        items: [],
        total,
        hasMore: false,
      };
    }

    // Get paginated items
    const items = await ctx.apiHistoryRepository.findAllWithPagination(
      filterCriteria,
      dateFilter,
      {
        offset,
        limit,
        orderBy: { createdAt: 'desc' },
      },
    );

    return {
      items,
      total,
      hasMore: offset + limit < total,
    };
  }

  public async getApiHistoryDetail(
    _root: unknown,
    args: { id: string },
    ctx: IContext,
  ) {
    return ctx.apiHistoryRepository.findOneBy({ id: args.id });
  }

  /**
   * Resolver for ApiHistoryResponse fields
   */
  public getApiHistoryNestedResolver = () => ({
    context: async (apiHistory: ApiHistory, _args: unknown, ctx: IContext) => {
      let tenancyContext = null;
      try {
        tenancyContext =
          await ctx.projectRepository.getTenancyContextByProjectId(
            apiHistory.projectId,
          );
      } catch {
        tenancyContext = null;
      }

      const tenantId = tenancyContext?.tenant?.id;
      const attachedModels = tenantId
        ? await ctx.aiModelRepository.listTenantModels(tenantId, true)
        : [];
      const llmModel = attachedModels.find(
        (model) => model.usageType === 'COMPLETION',
      );
      const embeddingModel = attachedModels.find(
        (model) => model.usageType === 'EMBEDDING',
      );

      return {
        adid: getAdid(apiHistory, ctx),
        tenant: tenancyContext?.tenant || null,
        workspace: tenancyContext?.workspace || null,
        project: tenancyContext?.project || null,
        models: {
          llm: formatAttachedModel(llmModel),
          embedding: formatAttachedModel(embeddingModel),
        },
      };
    },
    headers: (apiHistory: ApiHistory) => {
      return sanitizeHeaders(apiHistory.headers);
    },
    createdAt: (apiHistory: ApiHistory) => {
      return apiHistory.createdAt
        ? new Date(apiHistory.createdAt).toISOString()
        : null;
    },
    updatedAt: (apiHistory: ApiHistory) => {
      return apiHistory.updatedAt
        ? new Date(apiHistory.updatedAt).toISOString()
        : null;
    },
    responsePayload: (apiHistory: ApiHistory) => {
      if (!apiHistory.responsePayload) return null;

      // If the response payload is an array, return it as is
      if (Array.isArray(apiHistory.responsePayload))
        return apiHistory.responsePayload;

      // Otherwise, sanitize the response payload
      return sanitizeResponsePayload(
        apiHistory.responsePayload,
        apiHistory.apiType,
      );
    },
  });
}
