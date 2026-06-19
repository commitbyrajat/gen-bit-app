import { useEffect, useMemo, useState } from 'react';
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
import { apiPath } from '@/utils/url';

interface RoleOption {
  id: number;
  name: string;
  display_name: string;
}

interface UserRow {
  id: number;
  adid: string;
  display_name: string;
  tenant_id?: number;
  workspace_id?: number;
  tenant_name?: string;
  workspace_name?: string;
  status: string;
  roles: { name: string; displayName: string }[];
}

export default function TenantUsersPage() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();

  const roleOptions = useMemo(
    () =>
      roles.map((role) => ({
        value: role.name,
        label: role.display_name,
      })),
    [roles],
  );

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(apiPath('/api/admin/users'));
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load users');
      setUsers(data.users);
      setRoles(data.roles);
      setTenants(data.tenants);
      setWorkspaces(data.workspaces);
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openCreate = () => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({ status: 'ACTIVE', password: 'Password@123' });
    setVisible(true);
  };

  const openEdit = (user: UserRow) => {
    setEditingUser(user);
    form.setFieldsValue({
      displayName: user.display_name,
      roleNames: user.roles.map((role) => role.name),
      tenantId: user.tenant_id,
      workspaceId: user.workspace_id,
      status: user.status,
    });
    setVisible(true);
  };

  const saveUser = async () => {
    const values = await form.validateFields();
    const response = await fetch(
      apiPath(
        editingUser ? `/api/admin/users/${editingUser.id}` : '/api/admin/users',
      ),
      {
        method: editingUser ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      },
    );
    const data = await response.json();
    if (!response.ok) {
      message.error(data.error || 'Unable to save user');
      return;
    }
    setVisible(false);
    fetchUsers();
  };

  return (
    <SimpleLayout loading={loading}>
      <PageLayout
        title="Tenant users and roles"
        description="Onboard users, assign tenant/workspace scope, and map one or more roles to each user."
        titleExtra={
          <Space>
            <Link href={Path.TenantWorkspaces}>
              <Button>Workspaces</Button>
            </Link>
            <Button type="primary" onClick={openCreate}>
              New user
            </Button>
          </Space>
        }
      >
        <Table
          rowKey="id"
          dataSource={users}
          pagination={{ pageSize: 10 }}
          columns={[
            { title: 'ADID', dataIndex: 'adid' },
            { title: 'Display name', dataIndex: 'display_name' },
            {
              title: 'Roles',
              render: (_, user: UserRow) => (
                <Space wrap>
                  {user.roles.map((role) => (
                    <Tag key={role.name}>{role.displayName}</Tag>
                  ))}
                </Space>
              ),
            },
            { title: 'Tenant', dataIndex: 'tenant_name' },
            { title: 'Workspace', dataIndex: 'workspace_name' },
            {
              title: 'Status',
              dataIndex: 'status',
              render: (status) => <Tag>{status}</Tag>,
            },
            {
              title: 'Actions',
              render: (_, user: UserRow) => (
                <Button size="small" onClick={() => openEdit(user)}>
                  Edit
                </Button>
              ),
            },
          ]}
        />
      </PageLayout>
      <Modal
        visible={visible}
        title={editingUser ? 'Edit user' : 'New user'}
        okText={editingUser ? 'Save' : 'Create'}
        onOk={saveUser}
        onCancel={() => setVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          {!editingUser && (
            <Form.Item
              label="ADID"
              name="adid"
              rules={[{ required: true, message: 'ADID is required' }]}
            >
              <Input />
            </Form.Item>
          )}
          <Form.Item
            label="Display name"
            name="displayName"
            rules={[{ required: true, message: 'Display name is required' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Password" name="password">
            <Input.Password />
          </Form.Item>
          <Form.Item label="Roles" name="roleNames">
            <Select mode="multiple" options={roleOptions} />
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
