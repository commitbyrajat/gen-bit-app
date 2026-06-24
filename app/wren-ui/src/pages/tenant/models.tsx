import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, gql } from '@apollo/client';
import {
  Button,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  message,
} from 'antd';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import styled from 'styled-components';
import SimpleLayout from '@/components/layouts/SimpleLayout';
import PageLayout from '@/components/layouts/PageLayout';
import { apiPath } from '@/utils/url';
import { useAuth } from '@/hooks/useAuth';
import { Permission, hasPermission } from '@/utils/rbac';

const AI_MODELS = gql`
  query AIModels($tenantId: Int) {
    aiModels {
      id
      name
      modelId
      provider
      baseUrl
      modelType
      dimension
      status
    }
    tenantAIModels(tenantId: $tenantId) {
      id
      tenantId
      tenantName
      usageType
      status
      model {
        id
        name
        modelId
        baseUrl
        modelType
        dimension
        status
      }
    }
    tenantAIModelAttachments: tenantAIModels {
      id
      tenantId
      tenantName
      model {
        id
      }
    }
  }
`;

const CREATE_AI_MODEL = gql`
  mutation CreateAIModel($data: CreateAIModelInput!) {
    createAIModel(data: $data) {
      id
    }
  }
`;

const UPDATE_AI_MODEL = gql`
  mutation UpdateAIModel($where: WhereIdInput!, $data: UpdateAIModelInput!) {
    updateAIModel(where: $where, data: $data) {
      id
    }
  }
`;

const DELETE_AI_MODEL = gql`
  mutation DeleteAIModel($where: WhereIdInput!) {
    deleteAIModel(where: $where)
  }
`;

const UPSERT_TENANT_AI_MODEL = gql`
  mutation UpsertTenantAIModel($data: UpsertTenantAIModelInput!) {
    upsertTenantAIModel(data: $data) {
      id
    }
  }
`;

const DELETE_TENANT_AI_MODEL = gql`
  mutation DeleteTenantAIModel($where: WhereIdInput!) {
    deleteTenantAIModel(where: $where)
  }
`;

interface TenantOption {
  id: number;
  name: string;
}

interface AIModelRow {
  id: number;
  name: string;
  modelId: string;
  provider: string;
  baseUrl: string;
  modelType: string;
  dimension?: number | null;
  status: string;
}

interface TenantAIModelRow {
  id: number;
  tenantId: number;
  tenantName?: string;
  usageType: string;
  status: string;
  model?: AIModelRow;
}

const PageContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 1280px;
  min-width: 0;
`;

const FilterBar = styled.div`
  align-items: center;
  display: flex;
  gap: 10px;
  min-width: 0;

  @media (max-width: 640px) {
    align-items: stretch;
    flex-direction: column;
  }
`;

const TableSurface = styled.div`
  background: var(--gray-1);
  border: 1px solid var(--gray-4);
  border-radius: 8px;
  min-width: 0;
  overflow: hidden;

  .ant-table {
    background: transparent;
  }

  .ant-table-container {
    overflow: auto;
  }
`;

const CellText = styled.span`
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: bottom;
  white-space: nowrap;
`;

const MODEL_PREFIX = 'litellm_proxy/';

const getProviderForModelType = (modelType?: string) =>
  modelType === 'EMBEDDING' ? 'litellm_embedder' : 'litellm_llm';

const stripModelPrefix = (value?: string) =>
  (value || '').trim().replace(new RegExp(`^${MODEL_PREFIX}`), '');

export default function TenantModelsPage() {
  const { user } = useAuth();
  const roles = user?.roles || [];
  const canManagePlatform = hasPermission(roles, Permission.MANAGE_PLATFORM);
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<number | undefined>(
    user?.tenantId || undefined,
  );
  const [modelModalVisible, setModelModalVisible] = useState(false);
  const [bindingModalVisible, setBindingModalVisible] = useState(false);
  const [selectedModelType, setSelectedModelType] = useState('COMPLETION');
  const [editingModel, setEditingModel] = useState<AIModelRow | null>(null);
  const [editingBinding, setEditingBinding] = useState<TenantAIModelRow | null>(
    null,
  );
  const [modelForm] = Form.useForm();
  const [bindingForm] = Form.useForm();

  const { data, loading, refetch } = useQuery(AI_MODELS, {
    variables: { tenantId: selectedTenantId },
    skip: !canManagePlatform && !user?.tenantId,
    fetchPolicy: 'cache-and-network',
  });
  const [createAIModel] = useMutation(CREATE_AI_MODEL);
  const [updateAIModel] = useMutation(UPDATE_AI_MODEL);
  const [deleteAIModel] = useMutation(DELETE_AI_MODEL);
  const [upsertTenantAIModel] = useMutation(UPSERT_TENANT_AI_MODEL);
  const [deleteTenantAIModel] = useMutation(DELETE_TENANT_AI_MODEL);

  const aiModels: AIModelRow[] = data?.aiModels || [];
  const tenantAIModels: TenantAIModelRow[] = data?.tenantAIModels || [];
  const tenantAIModelAttachments: TenantAIModelRow[] =
    data?.tenantAIModelAttachments || [];
  const completionModels = useMemo(
    () =>
      aiModels.filter((model) =>
        ['CHAT', 'COMPLETION'].includes(model.modelType),
      ),
    [aiModels],
  );
  const embeddingModels = useMemo(
    () => aiModels.filter((model) => model.modelType === 'EMBEDDING'),
    [aiModels],
  );

  useEffect(() => {
    const loadTenants = async () => {
      const response = await fetch(apiPath('/api/admin/tenants'));
      const payload = await response.json();
      if (!response.ok) {
        message.error(payload.error || 'Unable to load tenants');
        return;
      }
      setTenants(payload.tenants || []);
      if (!selectedTenantId && payload.tenants?.[0]) {
        setSelectedTenantId(payload.tenants[0].id);
      }
    };
    loadTenants();
  }, []);

  useEffect(() => {
    if (!canManagePlatform && user?.tenantId) {
      setSelectedTenantId(user.tenantId);
    }
  }, [canManagePlatform, user?.tenantId]);

  const openModelModal = () => {
    setEditingModel(null);
    setSelectedModelType('COMPLETION');
    modelForm.resetFields();
    modelForm.setFieldsValue({
      provider: 'litellm_llm',
      modelType: 'COMPLETION',
      status: 'ACTIVE',
    });
    setModelModalVisible(true);
  };

  const openEditModelModal = (model: AIModelRow) => {
    setEditingModel(model);
    setSelectedModelType(model.modelType);
    modelForm.resetFields();
    modelForm.setFieldsValue({
      name: model.name,
      modelId: stripModelPrefix(model.modelId),
      baseUrl: model.baseUrl,
      provider: getProviderForModelType(model.modelType),
      modelType: model.modelType,
      dimension: model.dimension,
      status: model.status,
    });
    setModelModalVisible(true);
  };

  const openBindingModal = () => {
    setEditingBinding(null);
    bindingForm.resetFields();
    bindingForm.setFieldsValue({
      tenantId: selectedTenantId,
      usageType: 'COMPLETION',
      status: 'ACTIVE',
    });
    setBindingModalVisible(true);
  };

  const openEditBindingModal = (binding: TenantAIModelRow) => {
    setEditingBinding(binding);
    bindingForm.resetFields();
    bindingForm.setFieldsValue({
      tenantId: binding.tenantId,
      usageType: binding.usageType,
      aiModelId: binding.model?.id,
      status: binding.status,
    });
    setBindingModalVisible(true);
  };

  const saveModel = async () => {
    const values = await modelForm.validateFields();
    const modelType = values.modelType;
    try {
      const data = {
        ...values,
        modelId: stripModelPrefix(values.modelId),
        provider: getProviderForModelType(modelType),
        dimension: modelType === 'EMBEDDING' ? Number(values.dimension) : null,
      };
      if (editingModel) {
        await updateAIModel({
          variables: {
            where: { id: editingModel.id },
            data,
          },
        });
        message.success('Model updated');
      } else {
        await createAIModel({
          variables: {
            data,
          },
        });
        message.success('Model created');
      }
      setModelModalVisible(false);
      setEditingModel(null);
      refetch();
    } catch (error: any) {
      message.error(error.message || 'Unable to save model');
    }
  };

  const getModelAttachments = (modelId: number) =>
    tenantAIModelAttachments.filter((binding) => binding.model?.id === modelId);

  const removeModel = (model: AIModelRow) => {
    const attachments = getModelAttachments(model.id);
    if (attachments.length) {
      message.warning(
        'This model is attached to a tenant. First de-link the model from tenant before removing it.',
      );
      return;
    }

    Modal.confirm({
      title: 'Remove catalog model?',
      content: `This removes "${model.name}" from the model catalog.`,
      okText: 'Remove',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteAIModel({ variables: { where: { id: model.id } } });
          message.success('Model removed');
          refetch();
        } catch (error: any) {
          message.error(error.message || 'Unable to remove model');
        }
      },
    });
  };

  const removeTenantModel = (binding: TenantAIModelRow) => {
    Modal.confirm({
      title: 'De-link tenant model?',
      content: `This removes the ${binding.usageType.toLowerCase()} model key from ${binding.tenantName}.`,
      okText: 'De-link',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteTenantAIModel({
            variables: { where: { id: binding.id } },
          });
          message.success('Tenant model de-linked');
          refetch({ tenantId: selectedTenantId });
        } catch (error: any) {
          message.error(error.message || 'Unable to de-link tenant model');
        }
      },
    });
  };

  const saveBinding = async () => {
    const values = await bindingForm.validateFields();
    try {
      await upsertTenantAIModel({ variables: { data: values } });
      setSelectedTenantId(values.tenantId);
      setBindingModalVisible(false);
      setEditingBinding(null);
      refetch({ tenantId: values.tenantId });
      message.success(
        editingBinding ? 'Tenant model key updated' : 'Tenant model key saved',
      );
    } catch (error: any) {
      message.error(error.message || 'Unable to save tenant model key');
    }
  };

  const modelOptionsForUsage = (usageType?: string) =>
    (usageType === 'EMBEDDING' ? embeddingModels : completionModels).map(
      (model) => ({
        value: model.id,
        label: `${model.name} (${model.modelId})`,
      }),
    );

  const watchedUsageType = Form.useWatch('usageType', bindingForm);
  return (
    <SimpleLayout loading={loading}>
      <PageLayout
        title="Tenant AI models"
        description="Onboard enterprise proxy models and bind tenant-specific completion and embedding keys."
        titleExtra={
          <Space>
            {canManagePlatform && (
              <Button onClick={openModelModal}>New model</Button>
            )}
            <Button type="primary" onClick={openBindingModal}>
              Attach tenant key
            </Button>
          </Space>
        }
      >
        <PageContent>
          <FilterBar>
            <span>Tenant</span>
            <Select
              style={{ minWidth: 260, maxWidth: 360 }}
              value={selectedTenantId}
              disabled={!canManagePlatform}
              onChange={(value) => setSelectedTenantId(value)}
              options={tenants.map((tenant) => ({
                value: tenant.id,
                label: tenant.name,
              }))}
            />
          </FilterBar>
          <TableSurface>
            <Table
              rowKey="id"
              dataSource={tenantAIModels}
              pagination={false}
              scroll={{ x: 1110 }}
              tableLayout="fixed"
              columns={[
                {
                  title: 'Actions',
                  key: 'actions',
                  width: 130,
                  fixed: 'left',
                  render: (_, row: TenantAIModelRow) => (
                    <Space>
                      <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => openEditBindingModal(row)}
                      />
                      <Button
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => removeTenantModel(row)}
                      />
                    </Space>
                  ),
                },
                {
                  title: 'Tenant',
                  dataIndex: 'tenantName',
                  width: 180,
                  render: (value) => <CellText title={value}>{value}</CellText>,
                },
                {
                  title: 'Usage',
                  dataIndex: 'usageType',
                  width: 140,
                  render: (usageType) => <Tag>{usageType}</Tag>,
                },
                {
                  title: 'Model',
                  width: 190,
                  render: (_, row: TenantAIModelRow) => (
                    <CellText title={row.model?.name}>
                      {row.model?.name}
                    </CellText>
                  ),
                },
                {
                  title: 'Model ID',
                  width: 220,
                  render: (_, row: TenantAIModelRow) => (
                    <CellText title={row.model?.modelId}>
                      {row.model?.modelId}
                    </CellText>
                  ),
                },
                {
                  title: 'Base URL',
                  width: 320,
                  render: (_, row: TenantAIModelRow) => (
                    <CellText title={row.model?.baseUrl}>
                      {row.model?.baseUrl}
                    </CellText>
                  ),
                },
                {
                  title: 'Status',
                  dataIndex: 'status',
                  width: 120,
                  render: (status) => <Tag>{status}</Tag>,
                },
              ]}
            />
          </TableSurface>
          {canManagePlatform && (
            <TableSurface>
              <Table
                rowKey="id"
                dataSource={aiModels}
                pagination={{ pageSize: 8 }}
                scroll={{ x: 1180 }}
                tableLayout="fixed"
                columns={[
                  {
                    title: 'Actions',
                    key: 'actions',
                    width: 130,
                    fixed: 'left',
                    render: (_, row: AIModelRow) => (
                      <Space>
                        <Button
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => openEditModelModal(row)}
                        />
                        <Button
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => removeModel(row)}
                        />
                      </Space>
                    ),
                  },
                  {
                    title: 'Catalog model',
                    dataIndex: 'name',
                    width: 200,
                    render: (value) => (
                      <CellText title={value}>{value}</CellText>
                    ),
                  },
                  {
                    title: 'Model ID',
                    dataIndex: 'modelId',
                    width: 220,
                    render: (value) => (
                      <CellText title={value}>{value}</CellText>
                    ),
                  },
                  {
                    title: 'Provider',
                    dataIndex: 'provider',
                    width: 140,
                    render: (value) => (
                      <CellText title={value}>{value}</CellText>
                    ),
                  },
                  {
                    title: 'Base URL',
                    dataIndex: 'baseUrl',
                    width: 280,
                    render: (value) => (
                      <CellText title={value}>{value}</CellText>
                    ),
                  },
                  {
                    title: 'Dimensions',
                    dataIndex: 'dimension',
                    width: 120,
                    render: (_, row: AIModelRow) =>
                      row.modelType === 'EMBEDDING'
                        ? row.dimension || '-'
                        : '-',
                  },
                  {
                    title: 'Type',
                    dataIndex: 'modelType',
                    width: 140,
                    render: (modelType) => <Tag>{modelType}</Tag>,
                  },
                  {
                    title: 'Status',
                    dataIndex: 'status',
                    width: 120,
                    render: (status) => <Tag>{status}</Tag>,
                  },
                ]}
              />
            </TableSurface>
          )}
        </PageContent>
      </PageLayout>
      <Modal
        visible={modelModalVisible}
        title={editingModel ? 'Update proxy model' : 'New proxy model'}
        okText={editingModel ? 'Update' : 'Create'}
        onOk={saveModel}
        onCancel={() => {
          setModelModalVisible(false);
          setEditingModel(null);
          setSelectedModelType('COMPLETION');
        }}
        destroyOnClose
      >
        <Form form={modelForm} layout="vertical">
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Model name is required' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Model name"
            name="modelId"
            normalize={stripModelPrefix}
            rules={[{ required: true, message: 'Model name is required' }]}
          >
            <Input addonBefore={MODEL_PREFIX} placeholder="gemini-2.5-flash" />
          </Form.Item>
          <Form.Item
            label="Base URL"
            name="baseUrl"
            rules={[{ required: true, message: 'Base URL is required' }]}
          >
            <Input placeholder="https://proxy.example.com/v1" />
          </Form.Item>
          <Form.Item label="Provider">
            <Input
              value={getProviderForModelType(selectedModelType)}
              disabled
            />
          </Form.Item>
          <Form.Item label="Type" name="modelType">
            <Select
              onChange={(value) => {
                setSelectedModelType(value);
                modelForm.setFieldsValue({
                  provider: getProviderForModelType(value),
                  dimension: value === 'EMBEDDING' ? 1536 : undefined,
                });
              }}
              options={[
                { value: 'COMPLETION', label: 'LLM' },
                { value: 'EMBEDDING', label: 'EMBEDDER' },
              ]}
            />
          </Form.Item>
          {selectedModelType === 'EMBEDDING' && (
            <Form.Item
              label="Dimensions"
              name="dimension"
              rules={[
                { required: true, message: 'Dimensions are required' },
                {
                  type: 'number',
                  min: 1,
                  transform: (value) => Number(value),
                  message: 'Dimensions must be a positive number',
                },
              ]}
            >
              <Input type="number" min={1} placeholder="1536" />
            </Form.Item>
          )}
          <Form.Item label="Status" name="status">
            <Select
              options={[
                { value: 'ACTIVE', label: 'ACTIVE' },
                { value: 'INACTIVE', label: 'INACTIVE' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        visible={bindingModalVisible}
        title={
          editingBinding ? 'Update tenant model key' : 'Attach tenant model key'
        }
        okText="Save"
        onOk={saveBinding}
        onCancel={() => {
          setBindingModalVisible(false);
          setEditingBinding(null);
        }}
        destroyOnClose
      >
        <Form form={bindingForm} layout="vertical">
          <Form.Item
            label="Tenant"
            name="tenantId"
            rules={[{ required: true, message: 'Tenant is required' }]}
          >
            <Select
              disabled={!canManagePlatform || !!editingBinding}
              options={tenants.map((tenant) => ({
                value: tenant.id,
                label: tenant.name,
              }))}
            />
          </Form.Item>
          <Form.Item label="Usage" name="usageType">
            <Select
              disabled={!!editingBinding}
              onChange={() =>
                bindingForm.setFieldsValue({ aiModelId: undefined })
              }
              options={[
                { value: 'COMPLETION', label: 'COMPLETION' },
                { value: 'EMBEDDING', label: 'EMBEDDING' },
              ]}
            />
          </Form.Item>
          <Form.Item
            label="Model"
            name="aiModelId"
            rules={[{ required: true, message: 'Model is required' }]}
          >
            <Select
              disabled={!!editingBinding}
              options={modelOptionsForUsage(watchedUsageType)}
            />
          </Form.Item>
          <Form.Item
            label="API key"
            name="apiKey"
            rules={[{ required: true, message: 'API key is required' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item label="Status" name="status">
            <Select
              options={[
                { value: 'ACTIVE', label: 'ACTIVE' },
                { value: 'INACTIVE', label: 'INACTIVE' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </SimpleLayout>
  );
}
