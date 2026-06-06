import { useEffect, useState } from 'react';
import Link from 'next/link';
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
import { Path } from '@/utils/enum';

interface WorkspaceRow {
  id: number;
  tenant_id: number;
  tenant_name: string;
  name: string;
  slug: string;
  status: string;
  memberCount: number;
}

export default function TenantWorkspacesPage() {
  const [loading, setLoading] = useState(false);
  const [workspaces, setWorkspaces] = useState<WorkspaceRow[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [editingWorkspace, setEditingWorkspace] = useState<WorkspaceRow | null>(
    null,
  );
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchWorkspaces = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/workspaces');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to load workspaces');
      }
      setWorkspaces(data.workspaces);
      setTenants(data.tenants);
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const openCreate = () => {
    setEditingWorkspace(null);
    form.resetFields();
    form.setFieldsValue({ status: 'ACTIVE' });
    setVisible(true);
  };

  const openEdit = (workspace: WorkspaceRow) => {
    setEditingWorkspace(workspace);
    form.setFieldsValue({
      tenantId: workspace.tenant_id,
      name: workspace.name,
      slug: workspace.slug,
      status: workspace.status,
    });
    setVisible(true);
  };

  const saveWorkspace = async () => {
    const values = await form.validateFields();
    const response = await fetch(
      editingWorkspace
        ? `/api/admin/workspaces/${editingWorkspace.id}`
        : '/api/admin/workspaces',
      {
        method: editingWorkspace ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      },
    );
    const data = await response.json();
    if (!response.ok) {
      message.error(data.error || 'Unable to save workspace');
      return;
    }
    setVisible(false);
    fetchWorkspaces();
  };

  return (
    <SimpleLayout loading={loading}>
      <PageLayout
        title="Tenant workspaces"
        description="Create and configure team/use-case workspaces inside tenant boundaries."
        titleExtra={
          <Space>
            <Link href={Path.TenantUsers}>
              <Button>Users</Button>
            </Link>
            <Button type="primary" onClick={openCreate}>
              New workspace
            </Button>
          </Space>
        }
      >
        <Table
          rowKey="id"
          dataSource={workspaces}
          pagination={false}
          columns={[
            { title: 'Workspace', dataIndex: 'name' },
            { title: 'Tenant', dataIndex: 'tenant_name' },
            { title: 'Slug', dataIndex: 'slug' },
            { title: 'Members', dataIndex: 'memberCount' },
            {
              title: 'Status',
              dataIndex: 'status',
              render: (status) => <Tag>{status}</Tag>,
            },
            {
              title: 'Actions',
              render: (_, workspace: WorkspaceRow) => (
                <Space>
                  <Button size="small" onClick={() => openEdit(workspace)}>
                    Configure
                  </Button>
                </Space>
              ),
            },
          ]}
        />
      </PageLayout>
      <Modal
        visible={visible}
        title={editingWorkspace ? 'Configure workspace' : 'New workspace'}
        okText={editingWorkspace ? 'Save' : 'Create'}
        onOk={saveWorkspace}
        onCancel={() => setVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          {!editingWorkspace && (
            <Form.Item
              label="Tenant"
              name="tenantId"
              rules={[{ required: true, message: 'Tenant is required' }]}
            >
              <Select
                options={tenants.map((tenant) => ({
                  value: tenant.id,
                  label: tenant.name,
                }))}
              />
            </Form.Item>
          )}
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Workspace name is required' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Slug" name="slug">
            <Input />
          </Form.Item>
          <Form.Item label="Status" name="status" initialValue="ACTIVE">
            <Select
              options={[
                { value: 'ACTIVE', label: 'ACTIVE' },
                { value: 'SUSPENDED', label: 'SUSPENDED' },
                { value: 'ARCHIVED', label: 'ARCHIVED' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </SimpleLayout>
  );
}
