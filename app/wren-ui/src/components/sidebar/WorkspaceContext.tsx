import BankOutlined from '@ant-design/icons/BankOutlined';
import TeamOutlined from '@ant-design/icons/TeamOutlined';
import styled from 'styled-components';
import { useGetSettingsQuery } from '@/apollo/client/graphql/settings.generated';

const Section = styled.div`
  border-top: 1px solid var(--gray-4);
  padding: 12px 16px;
`;

const Title = styled.div`
  color: var(--gray-7);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  margin-bottom: 10px;
  text-transform: uppercase;
`;

const ContextItem = styled.div`
  display: grid;
  gap: 10px;
  grid-template-columns: 18px minmax(0, 1fr);

  & + & {
    margin-top: 12px;
  }
`;

const ContextLabel = styled.div`
  color: var(--gray-6);
  font-size: 11px;
  line-height: 1.3;
`;

const ContextValue = styled.div`
  color: var(--gray-9);
  font-size: 13px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ContextMeta = styled.div`
  color: var(--gray-6);
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export default function WorkspaceContext() {
  const { data } = useGetSettingsQuery({
    fetchPolicy: 'cache-and-network',
  });
  const tenant = data?.settings.tenancy.tenant;
  const workspace = data?.settings.tenancy.workspace;

  return (
    <Section>
      <Title>Workspace context</Title>
      <ContextItem>
        <BankOutlined className="gray-7 mt-1" />
        <div>
          <ContextLabel>Tenant</ContextLabel>
          <ContextValue title={tenant?.name || 'Unassigned'}>
            {tenant?.name || 'Unassigned'}
          </ContextValue>
          <ContextMeta title={tenant?.slug || ''}>
            {tenant?.slug || tenant?.status || 'No tenant details'}
          </ContextMeta>
        </div>
      </ContextItem>
      <ContextItem>
        <TeamOutlined className="gray-7 mt-1" />
        <div>
          <ContextLabel>Workspace</ContextLabel>
          <ContextValue title={workspace?.name || 'Unassigned'}>
            {workspace?.name || 'Unassigned'}
          </ContextValue>
          <ContextMeta title={workspace?.slug || ''}>
            {workspace?.slug || workspace?.status || 'No workspace details'}
          </ContextMeta>
        </div>
      </ContextItem>
    </Section>
  );
}
