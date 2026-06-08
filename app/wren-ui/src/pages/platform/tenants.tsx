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

interface TenantRow {
  id: number;
  name: string;
  slug: string;
  status: string;
  workspaceCount: number;
  userCount: number;
}

export default function PlatformTenantsPage() {
  const [loading, setLoading] = useState(false);
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/tenants');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load tenants');
      setTenants(data.tenants);
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const createTenant = async () => {
    const values = await form.validateFields();
    const response = await fetch('/api/admin/tenants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    const data = await response.json();
    if (!response.ok) {
      message.error(data.error || 'Unable to create tenant');
      return;
    }
    setTenants(data.tenants);
    setVisible(false);
    form.resetFields();
  };

  const updateStatus = async (tenant: TenantRow, status: string) => {
    const response = await fetch(`/api/admin/tenants/${tenant.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = await response.json();
    if (!response.ok) {
      message.error(data.error || 'Unable to update tenant');
      return;
    }
    fetchTenants();
  };

  return (
    <SimpleLayout loading={loading}>
      <PageLayout
        title="Tenant provisioning"
        description="Create tenants, track workspace/user coverage, and suspend or reactivate business-unit tenants."
        titleExtra={
          <Button type="primary" onClick={() => setVisible(true)}>
            New tenant
          </Button>
        }
      >
        <Table
          rowKey="id"
          dataSource={tenants}
          pagination={false}
          columns={[
            { title: 'Tenant', dataIndex: 'name' },
            { title: 'Slug', dataIndex: 'slug' },
            {
              title: 'Status',
              dataIndex: 'status',
              render: (status) => <Tag>{status}</Tag>,
            },
            { title: 'Workspaces', dataIndex: 'workspaceCount' },
            { title: 'Users', dataIndex: 'userCount' },
            {
              title: 'Actions',
              render: (_, tenant: TenantRow) => (
                <Space>
                  <Button
                    size="small"
                    onClick={() =>
                      updateStatus(
                        tenant,
                        tenant.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE',
                      )
                    }
                  >
                    {tenant.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                  </Button>
                </Space>
              ),
            },
          ]}
        />
      </PageLayout>
      <Modal
        visible={visible}
        title="New tenant"
        okText="Create"
        onOk={createTenant}
        onCancel={() => setVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Tenant name is required' }]}
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
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </SimpleLayout>
  );
}
