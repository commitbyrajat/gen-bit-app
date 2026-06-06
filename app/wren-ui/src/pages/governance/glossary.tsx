import { useEffect, useState } from 'react';
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
import SimpleLayout from '@/components/layouts/SimpleLayout';
import PageLayout from '@/components/layouts/PageLayout';

interface GovernanceAsset {
  id: number;
  name: string;
  description?: string;
  tenant_name?: string;
  workspace_name?: string;
  status: string;
  created_by?: string;
  decided_by?: string;
}

export default function GovernanceGlossaryPage() {
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState<GovernanceAsset[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        '/api/admin/governance-assets?type=GLOSSARY',
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || 'Unable to load glossary');
      setAssets(data.assets);
      setTenants(data.tenants);
      setWorkspaces(data.workspaces);
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const createAsset = async () => {
    const values = await form.validateFields();
    const response = await fetch('/api/admin/governance-assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...values, assetType: 'GLOSSARY' }),
    });
    const data = await response.json();
    if (!response.ok) {
      message.error(data.error || 'Unable to create glossary item');
      return;
    }
    setVisible(false);
    form.resetFields();
    fetchAssets();
  };

  const updateStatus = async (asset: GovernanceAsset, status: string) => {
    const response = await fetch(`/api/admin/governance-assets/${asset.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = await response.json();
    if (!response.ok) {
      message.error(data.error || 'Unable to update glossary item');
      return;
    }
    fetchAssets();
  };

  return (
    <SimpleLayout loading={loading}>
      <PageLayout
        title="Business glossary"
        description="Capture governed business terms and certify them for tenant semantic usage."
        titleExtra={
          <Button type="primary" onClick={() => setVisible(true)}>
            New term
          </Button>
        }
      >
        <Table
          rowKey="id"
          dataSource={assets}
          pagination={{ pageSize: 10 }}
          columns={[
            { title: 'Term', dataIndex: 'name' },
            { title: 'Definition', dataIndex: 'description' },
            { title: 'Tenant', dataIndex: 'tenant_name' },
            { title: 'Workspace', dataIndex: 'workspace_name' },
            {
              title: 'Status',
              dataIndex: 'status',
              render: (status) => <Tag>{status}</Tag>,
            },
            { title: 'Created by', dataIndex: 'created_by' },
            { title: 'Certified by', dataIndex: 'decided_by' },
            {
              title: 'Actions',
              render: (_, asset: GovernanceAsset) => (
                <Space>
                  <Button
                    size="small"
                    onClick={() => updateStatus(asset, 'CERTIFIED')}
                  >
                    Certify
                  </Button>
                  <Button
                    size="small"
                    onClick={() => updateStatus(asset, 'DRAFT')}
                  >
                    Reopen
                  </Button>
                </Space>
              ),
            },
          ]}
        />
      </PageLayout>
      <Modal
        visible={visible}
        title="New glossary term"
        okText="Create"
        onOk={createAsset}
        onCancel={() => setVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Term"
            name="name"
            rules={[{ required: true, message: 'Term is required' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Definition" name="description">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item label="Tenant" name="tenantId">
            <Select
              allowClear
              options={tenants.map((tenant) => ({
                value: tenant.id,
                label: tenant.name,
              }))}
            />
          </Form.Item>
          <Form.Item label="Workspace" name="workspaceId">
            <Select
              allowClear
              options={workspaces.map((workspace) => ({
                value: workspace.id,
                label: workspace.name,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </SimpleLayout>
  );
}
