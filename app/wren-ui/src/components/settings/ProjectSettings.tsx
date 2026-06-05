import {
  Button,
  Modal,
  Select,
  Row,
  Col,
  Form,
  message,
  Typography,
} from 'antd';
import { useRouter } from 'next/router';
import { Path } from '@/utils/enum';
import {
  useResetCurrentProjectMutation,
  useUpdateCurrentProjectMutation,
} from '@/apollo/client/graphql/settings.generated';
import { getLanguageText } from '@/utils/language';
import { ProjectLanguage } from '@/apollo/client/graphql/__types__';
import { GetSettingsQuery } from '@/apollo/client/graphql/settings.generated';
import styled from 'styled-components';

interface Props {
  data: {
    language: string;
    tenancy?: GetSettingsQuery['settings']['tenancy'];
  };
}

const ContextGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const ContextItem = styled.div`
  border: 1px solid var(--gray-4);
  border-radius: 4px;
  background: var(--gray-1);
  padding: 12px;
  min-width: 0;
`;

const ContextValue = styled.div`
  color: var(--gray-9);
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ContextLabel = styled.div`
  color: var(--gray-7);
  font-size: 12px;
  margin-bottom: 4px;
`;

export default function ProjectSettings(props: Props) {
  const { data } = props;
  const router = useRouter();
  const [form] = Form.useForm();
  const [resetCurrentProject, { client }] = useResetCurrentProjectMutation({
    onError: (error) => console.error(error),
  });
  const languageOptions = Object.keys(ProjectLanguage).map((key) => {
    return { label: getLanguageText(key as ProjectLanguage), value: key };
  });

  const [updateCurrentProject, { loading }] = useUpdateCurrentProjectMutation({
    refetchQueries: ['GetSettings'],
    onError: (error) => console.error(error),
    onCompleted: () => {
      message.success('Successfully updated project language.');
    },
  });

  const reset = () => {
    Modal.confirm({
      title: 'Are you sure you want to reset?',
      okButtonProps: { danger: true },
      okText: 'Reset',
      onOk: async () => {
        await resetCurrentProject();
        client.clearStore();
        router.push(Path.OnboardingConnection);
      },
    });
  };

  const submit = () => {
    form
      .validateFields()
      .then((values) => {
        updateCurrentProject({ variables: { data: values } });
      })
      .catch((error) => console.error(error));
  };

  return (
    <div className="py-3 px-4">
      <div className="mb-4">
        <Typography.Title level={5} className="mb-2">
          Tenant context
        </Typography.Title>
        <ContextGrid>
          <ContextItem>
            <ContextLabel>Tenant</ContextLabel>
            <ContextValue title={data.tenancy?.tenant?.name || 'Unassigned'}>
              {data.tenancy?.tenant?.name || 'Unassigned'}
            </ContextValue>
            <div className="gray-7 text-sm">
              {data.tenancy?.tenant?.status || 'No status'}
            </div>
          </ContextItem>
          <ContextItem>
            <ContextLabel>Workspace</ContextLabel>
            <ContextValue title={data.tenancy?.workspace?.name || 'Unassigned'}>
              {data.tenancy?.workspace?.name || 'Unassigned'}
            </ContextValue>
            <div className="gray-7 text-sm">
              {data.tenancy?.workspace?.status || 'No status'}
            </div>
          </ContextItem>
          <ContextItem>
            <ContextLabel>Data connection</ContextLabel>
            <ContextValue
              title={
                data.tenancy?.project?.displayName ||
                `Connection ${data.tenancy?.project?.id || ''}`
              }
            >
              {data.tenancy?.project?.displayName ||
                `Connection ${data.tenancy?.project?.id || '-'}`}
            </ContextValue>
            <div className="gray-7 text-sm">
              {data.tenancy?.project?.type || 'Unknown'}
            </div>
          </ContextItem>
        </ContextGrid>
      </div>
      <Form
        form={form}
        layout="vertical"
        initialValues={{ language: data.language }}
      >
        <Form.Item
          label="Workspace language"
          extra="This setting will affect the language in which the AI responds to you."
        >
          <Row gutter={16} wrap={false}>
            <Col className="flex-grow-1">
              <Form.Item name="language" noStyle>
                <Select
                  placeholder="Select a language"
                  showSearch
                  options={languageOptions}
                />
              </Form.Item>
            </Col>
            <Col>
              <Button
                type="primary"
                style={{ width: 70 }}
                onClick={submit}
                loading={loading}
              >
                Save
              </Button>
            </Col>
          </Row>
        </Form.Item>
      </Form>
      <div className="gray-8 mb-2">Reset current data connection</div>
      <Button type="primary" style={{ width: 70 }} danger onClick={reset}>
        Reset
      </Button>
      <div className="gray-6 mt-1">
        Please be aware that resetting will delete all current settings and
        records for the active data connection, including modeling metadata and
        Home Page threads.
      </div>
    </div>
  );
}
