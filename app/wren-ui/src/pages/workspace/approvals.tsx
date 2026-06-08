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
import { useAuth } from '@/hooks/useAuth';
import { Permission, hasPermission } from '@/utils/rbac';

interface ApprovalRow {
  id: number;
  name: string;
  description?: string;
  tenant_name?: string;
  workspace_name?: string;
  status: string;
  created_by?: string;
  decided_by?: string;
}

export default function WorkspaceApprovalsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState<ApprovalRow[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const canApprove =
    user && hasPermission(user.roles, Permission.MANAGE_WORKSPACE);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        '/api/admin/governance-assets?type=APPROVAL',
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load assets');
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

  const submitAsset = async () => {
    const values = await form.validateFields();
    const response = await fetch('/api/admin/governance-assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...values,
        assetType: 'APPROVAL',
        status: 'PENDING',
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      message.error(data.error || 'Unable to submit asset');
      return;
    }
    setVisible(false);
    form.resetFields();
    fetchAssets();
  };

  const decideAsset = async (asset: ApprovalRow, status: string) => {
    const response = await fetch(`/api/admin/governance-assets/${asset.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = await response.json();
    if (!response.ok) {
      message.error(data.error || 'Unable to update asset');
      return;
    }
    fetchAssets();
  };

  return (
    <SimpleLayout loading={loading}>
      <PageLayout
        title="Workspace asset approvals"
        description="Submit dashboards, reports, saved queries, and AI assets for workspace-owner approval."
        titleExtra={
          <Button type="primary" onClick={() => setVisible(true)}>
            Submit asset
          </Button>
        }
      >
        <Table
          rowKey="id"
          dataSource={assets}
          pagination={{ pageSize: 10 }}
          columns={[
            { title: 'Asset', dataIndex: 'name' },
            { title: 'Description', dataIndex: 'description' },
            { title: 'Tenant', dataIndex: 'tenant_name' },
            { title: 'Workspace', dataIndex: 'workspace_name' },
            {
              title: 'Status',
              dataIndex: 'status',
              render: (status) => <Tag>{status}</Tag>,
            },
            { title: 'Submitted by', dataIndex: 'created_by' },
            { title: 'Decided by', dataIndex: 'decided_by' },
            {
              title: 'Actions',
              render: (_, asset: ApprovalRow) =>
                canApprove ? (
                  <Space>
                    <Button
                      size="small"
                      onClick={() => decideAsset(asset, 'APPROVED')}
                    >
                      Approve
                    </Button>
                    <Button
                      size="small"
                      onClick={() => decideAsset(asset, 'REJECTED')}
                    >
                      Reject
                    </Button>
                  </Space>
                ) : null,
            },
          ]}
        />
      </PageLayout>
      <Modal
        visible={visible}
        title="Submit asset"
        okText="Submit"
        onOk={submitAsset}
        onCancel={() => setVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Asset name"
            name="name"
            rules={[{ required: true, message: 'Asset name is required' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Description" name="description">
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
