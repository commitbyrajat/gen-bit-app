import { gql, useQuery } from '@apollo/client';
import { Drawer, Typography, Row, Col, Tag } from 'antd';
import { getAbsoluteTime } from '@/utils/time';
import { DrawerAction } from '@/hooks/useDrawerAction';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import CloseCircleOutlined from '@ant-design/icons/CloseCircleOutlined';
import JsonCodeBlock from '@/components/code/JsonCodeBlock';
import { ApiHistoryResponse } from '@/apollo/client/graphql/__types__';

type Props = DrawerAction<ApiHistoryResponse> & {
  loading?: boolean;
};

const API_HISTORY_DETAIL = gql`
  query ApiHistoryDetail($id: String!) {
    apiHistoryDetail(id: $id) {
      id
      headers
      context
    }
  }
`;

const detailGridStyle = {
  border: '1px solid var(--gray-4)',
  borderRadius: 4,
  overflow: 'hidden',
};

const detailCellStyle = {
  borderBottom: '1px solid var(--gray-4)',
  padding: '8px 12px',
};

const detailLabelStyle = {
  color: 'var(--gray-7)',
  marginBottom: 4,
};

const DetailGrid = (props: {
  items: { label: string; value: React.ReactNode }[];
  columns?: 1 | 2;
}) => {
  const { items, columns = 2 } = props;
  return (
    <div style={detailGridStyle}>
      <Row>
        {items.map((item, index) => {
          const isLastRow =
            index >= items.length - (items.length % columns || columns);
          return (
            <Col
              key={item.label}
              span={columns === 1 ? 24 : 12}
              style={{
                ...detailCellStyle,
                borderBottom: isLastRow ? 'none' : detailCellStyle.borderBottom,
                borderRight:
                  columns === 2 && index % 2 === 0
                    ? '1px solid var(--gray-4)'
                    : 'none',
              }}
            >
              <div style={detailLabelStyle}>{item.label}</div>
              <div>{item.value || '-'}</div>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default function DetailsDrawer(props: Props) {
  const { visible, onClose, defaultValue } = props;
  const { data } = useQuery(API_HISTORY_DETAIL, {
    variables: { id: defaultValue?.id },
    skip: !visible || !defaultValue?.id,
    fetchPolicy: 'cache-and-network',
    onError: (error) => console.error(error),
  });
  const detail = data?.apiHistoryDetail || {};

  const {
    threadId,
    apiType,
    createdAt,
    durationMs,
    statusCode,
    headers: listHeaders,
    context: listContext,
    requestPayload,
    responsePayload,
  } = defaultValue || {};
  const headers = detail.headers || listHeaders;
  const context = detail.context || listContext;

  const getStatusTag = (status: number) => {
    const isSuccess = status >= 200 && status < 300;
    return (
      <Tag
        icon={isSuccess ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
        color={isSuccess ? 'success' : 'error'}
      >
        {status}
      </Tag>
    );
  };

  const renderModelDetails = (
    title: string,
    model?: {
      name?: string;
      model?: string;
      provider?: string;
      baseUrl?: string;
      status?: string;
      apiKey?: string;
    } | null,
  ) => (
    <div className="mb-4">
      <Typography.Text className="d-block gray-7 mb-2">{title}</Typography.Text>
      <DetailGrid
        columns={1}
        items={[
          { label: 'Name', value: model?.name },
          { label: 'Model', value: model?.model },
          { label: 'Provider', value: model?.provider },
          { label: 'Status', value: model?.status },
          { label: 'Base URL', value: model?.baseUrl },
          { label: 'Tenant key', value: model?.apiKey },
        ]}
      />
    </div>
  );

  return (
    <Drawer
      visible={visible}
      className="gray-8"
      title="API details"
      width={760}
      closable
      destroyOnClose
      onClose={onClose}
      footer={null}
    >
      <Row className="mb-6">
        <Col span={12}>
          <Typography.Text className="d-block gray-7 mb-2">
            API type
          </Typography.Text>
          <div>
            <Tag className="gray-8">{apiType?.toLowerCase()}</Tag>
          </div>
        </Col>
        <Col span={12}>
          <Typography.Text className="d-block gray-7 mb-2">
            Thread ID
          </Typography.Text>
          <div>{threadId || '-'}</div>
        </Col>
      </Row>
      <Row className="mb-6">
        <Col span={12}>
          <Typography.Text className="d-block gray-7 mb-2">
            Created at
          </Typography.Text>
          <div>{getAbsoluteTime(createdAt)}</div>
        </Col>
        <Col span={12}>
          <Typography.Text className="d-block gray-7 mb-2">
            Duration
          </Typography.Text>
          <div>{durationMs} ms</div>
        </Col>
      </Row>
      <Row className="mb-6">
        <Col span={12}>
          <Typography.Text className="d-block gray-7 mb-2">
            Status code
          </Typography.Text>
          <div>{getStatusTag(statusCode)}</div>
        </Col>
      </Row>

      <div className="mb-6">
        <Typography.Title level={5}>Caller and tenancy</Typography.Title>
        <DetailGrid
          items={[
            { label: 'ADID', value: context?.adid },
            {
              label: 'Project',
              value: context?.project?.displayName || context?.project?.id,
            },
            { label: 'Tenant', value: context?.tenant?.name },
            { label: 'Tenant ID', value: context?.tenant?.id },
            { label: 'Workspace', value: context?.workspace?.name },
            { label: 'Workspace ID', value: context?.workspace?.id },
          ]}
        />
      </div>

      <div className="mb-6">
        <Typography.Title level={5}>Tenant AI models</Typography.Title>
        {renderModelDetails('LLM', context?.models?.llm)}
        {renderModelDetails('Embedding', context?.models?.embedding)}
      </div>

      <div className="mb-6">
        <Typography.Text className="d-block gray-7 mb-2">
          Headers
        </Typography.Text>
        <JsonCodeBlock
          code={headers}
          backgroundColor="var(--gray-2)"
          maxHeight="400"
          copyable
        />
      </div>

      <div className="mb-6">
        <Typography.Text className="d-block gray-7 mb-2">
          Request payload
        </Typography.Text>
        <JsonCodeBlock
          code={requestPayload}
          backgroundColor="var(--gray-2)"
          maxHeight="400"
          copyable
        />
      </div>

      <div className="mb-6">
        <Typography.Text className="d-block gray-7 mb-2">
          Response payload
        </Typography.Text>
        <JsonCodeBlock
          code={responsePayload}
          backgroundColor="var(--gray-2)"
          maxHeight="400"
          copyable
        />
      </div>
    </Drawer>
  );
}
