import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Typography, Form, Row, Col, Button, Select } from 'antd';
import styled from 'styled-components';
import { DATA_SOURCES } from '@/utils/enum/dataSources';
import { apiPath } from '@/utils/url';
import { getDataSource, getPostgresErrorMessage } from './utils';

const StyledForm = styled(Form)`
  border: 1px var(--gray-4) solid;
  border-radius: 4px;
`;

const DataSource = styled.div`
  border: 1px var(--gray-4) solid;
  border-radius: 4px;
`;

interface Props {
  dataSource: DATA_SOURCES;
  onNext: (data: any) => void;
  onBack: () => void;
  submitting: boolean;
  connectError?: Record<string, any>;
}

interface TenantOption {
  id: number;
  name: string;
  status?: string;
}

interface WorkspaceOption {
  id: number;
  tenant_id: number;
  name: string;
  status?: string;
  tenant_name?: string;
}

export default function ConnectDataSource(props: Props) {
  const { connectError, dataSource, submitting, onNext, onBack } = props;
  const [form] = Form.useForm();
  const current = getDataSource(dataSource);
  const selectedTenantId = Form.useWatch('tenantId', form);
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [workspaces, setWorkspaces] = useState<WorkspaceOption[]>([]);
  const [scopeLoading, setScopeLoading] = useState(false);

  useEffect(() => {
    const loadScope = async () => {
      setScopeLoading(true);
      try {
        const response = await fetch(apiPath('/api/admin/workspaces'));
        if (!response.ok) return;
        const payload = await response.json();
        const activeTenants = (payload.tenants || []).filter(
          (tenant: TenantOption) => tenant.status !== 'DELETED',
        );
        const activeWorkspaces = (payload.workspaces || []).filter(
          (workspace: WorkspaceOption) => workspace.status !== 'DELETED',
        );
        setTenants(activeTenants);
        setWorkspaces(activeWorkspaces);

        const firstTenant = activeTenants[0];
        const firstWorkspace = firstTenant
          ? activeWorkspaces.find(
              (workspace: WorkspaceOption) =>
                workspace.tenant_id === firstTenant.id,
            )
          : null;
        form.setFieldsValue({
          tenantId: firstTenant?.id,
          workspaceId: firstWorkspace?.id,
        });
      } finally {
        setScopeLoading(false);
      }
    };

    loadScope();
  }, [form]);

  const tenantWorkspaces = useMemo(
    () =>
      workspaces.filter(
        (workspace) => workspace.tenant_id === Number(selectedTenantId),
      ),
    [selectedTenantId, workspaces],
  );

  const onTenantChange = (tenantId: number) => {
    const firstWorkspace = workspaces.find(
      (workspace) => workspace.tenant_id === tenantId,
    );
    form.setFieldsValue({ workspaceId: firstWorkspace?.id });
  };

  const submit = () => {
    form
      .validateFields()
      .then((values) => {
        const { tenantId, workspaceId, ...properties } = values;
        onNext && onNext({ properties, tenantId, workspaceId });
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <>
      <Typography.Title level={1} className="mb-3">
        Connect the data source
      </Typography.Title>

      <StyledForm form={form} layout="vertical" className="p-6 my-6">
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Tenant"
              name="tenantId"
              rules={[{ required: true, message: 'Please select a tenant' }]}
            >
              <Select
                loading={scopeLoading}
                placeholder="Select tenant"
                onChange={onTenantChange}
                options={tenants.map((tenant) => ({
                  label: tenant.name,
                  value: tenant.id,
                }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Workspace"
              name="workspaceId"
              rules={[{ required: true, message: 'Please select a workspace' }]}
            >
              <Select
                loading={scopeLoading}
                placeholder="Select workspace"
                options={tenantWorkspaces.map((workspace) => ({
                  label: workspace.name,
                  value: workspace.id,
                }))}
              />
            </Form.Item>
          </Col>
        </Row>
        {tenants.length === 0 && !scopeLoading && (
          <Alert
            type="warning"
            showIcon
            className="mb-6"
            message="No tenant/workspace scope available"
            description="Create a tenant and workspace before creating a data source connection."
          />
        )}
        <Row align="middle" className="mb-6">
          <Col span={12}>
            <DataSource className="d-inline-block px-4 py-2 bg-gray-2 gray-8">
              <Image
                className="mr-2"
                src={current.logo}
                alt={dataSource}
                width="40"
                height="40"
              />
              {current.label}
            </DataSource>
          </Col>
          <Col className="text-right" span={12}>
            Learn more information in the {current.label}{' '}
            <Link
              href={current.guide}
              target="_blank"
              rel="noopener noreferrer"
            >
              setup guide
            </Link>
            .
          </Col>
        </Row>
        <current.component />
      </StyledForm>

      {connectError && (
        <Alert
          message={connectError.shortMessage}
          description={
            dataSource === DATA_SOURCES.POSTGRES
              ? getPostgresErrorMessage(connectError)
              : connectError.message
          }
          type="error"
          showIcon
          className="my-6"
        />
      )}

      <Row gutter={16} className="pt-6">
        <Col span={12}>
          <Button
            onClick={onBack}
            size="large"
            className="adm-onboarding-btn"
            disabled={submitting}
          >
            Back
          </Button>
        </Col>
        <Col className="text-right" span={12}>
          <Button
            type="primary"
            size="large"
            onClick={submit}
            loading={submitting}
            className="adm-onboarding-btn"
          >
            Next
          </Button>
        </Col>
      </Row>
    </>
  );
}
