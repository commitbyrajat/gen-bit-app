import { useRouter } from 'next/router';
import styled from 'styled-components';
import { Path } from '@/utils/enum';
import Home, { Props as HomeSidebarProps } from './Home';
import Modeling, { Props as ModelingSidebarProps } from './Modeling';
import Knowledge from './Knowledge';
import APIManagement from './APIManagement';
import DashboardSidebar from './Dashboard';
import WorkspaceContext from './WorkspaceContext';
import LearningSection from '@/components/learning';

const Layout = styled.div`
  position: relative;
  height: 100%;
  background-color: var(--gray-2);
  color: var(--gray-8);
  padding-bottom: 12px;
  overflow-x: hidden;
`;

const Content = styled.div`
  flex-grow: 1;
  overflow-y: auto;
`;

type Props = ModelingSidebarProps | HomeSidebarProps;

const DynamicSidebar = (
  props: Props & {
    pathname: string;
  },
) => {
  const { pathname, ...restProps } = props;

  const getContent = () => {
    if (
      pathname === Path.Dashboard ||
      pathname === Path.OrganizationOnboarding ||
      pathname === Path.AskData ||
      pathname === Path.ModelingWorkspaces ||
      pathname.startsWith('/tenant') ||
      pathname.startsWith('/platform') ||
      pathname.startsWith('/workspace') ||
      pathname.startsWith('/governance')
    ) {
      return <DashboardSidebar />;
    }

    if (pathname.startsWith(Path.Home)) {
      return <Home {...(restProps as HomeSidebarProps)} />;
    }

    if (pathname.startsWith(Path.Modeling)) {
      return <Modeling {...(restProps as ModelingSidebarProps)} />;
    }

    if (pathname.startsWith(Path.Knowledge)) {
      return <Knowledge />;
    }

    if (pathname.startsWith(Path.APIManagement)) {
      return <APIManagement />;
    }

    return null;
  };

  return <Content>{getContent()}</Content>;
};

export default function Sidebar(props: Props) {
  const router = useRouter();
  const isWorkspaceScopedHome =
    router.pathname.startsWith(Path.Home) &&
    (typeof router.query.workspaceId === 'string' ||
      typeof router.query.connectionId === 'string');

  return (
    <Layout className="d-flex flex-column">
      <DynamicSidebar {...props} pathname={router.pathname} />
      {isWorkspaceScopedHome ? <WorkspaceContext /> : <LearningSection />}
    </Layout>
  );
}
