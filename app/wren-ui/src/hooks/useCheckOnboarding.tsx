import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useOnboardingStatusQuery } from '@/apollo/client/graphql/onboarding.generated';
import { OnboardingStatus } from '@/apollo/client/graphql/__types__';
import { Path } from '@/utils/enum';
import { appPath } from '@/utils/url';

const redirectRoute = {
  [OnboardingStatus.DATASOURCE_SAVED]: Path.OnboardingModels,
  [OnboardingStatus.NOT_STARTED]: Path.OnboardingConnection,
  [OnboardingStatus.ONBOARDING_FINISHED]: Path.Modeling,
  [OnboardingStatus.WITH_SAMPLE_DATASET]: Path.Modeling,
};

const bypassDataSourceOnboarding = (pathname: string) =>
  [
    Path.Dashboard,
    Path.OrganizationOnboarding,
    Path.DataSourceConnections,
    Path.PlatformTenants,
    Path.TenantUsers,
    Path.TenantWorkspaces,
    Path.WorkspaceApprovals,
    Path.GovernanceGlossary,
  ].some((path) => pathname.startsWith(path));

const withConnectionId = (
  path: string,
  connectionId: string | string[] | undefined,
) => {
  if (typeof connectionId !== 'string' || !connectionId) return path;
  if (
    ![Path.OnboardingModels, Path.OnboardingRelationships, Path.Modeling].some(
      (route) => path === route,
    )
  ) {
    return path;
  }

  return `${path}?connectionId=${encodeURIComponent(connectionId)}`;
};

export const useWithOnboarding = () => {
  const router = useRouter();
  const isConnectionScopedSetup =
    [Path.OnboardingModels, Path.OnboardingRelationships].includes(
      router.pathname as Path,
    ) &&
    (typeof router.query.connectionId === 'string' ||
      router.asPath.includes('connectionId='));
  const shouldBypass =
    bypassDataSourceOnboarding(router.pathname) || isConnectionScopedSetup;
  const { data, loading } = useOnboardingStatusQuery({
    skip: shouldBypass,
  });

  const onboardingStatus = data?.onboardingStatus?.status;

  useEffect(() => {
    if (shouldBypass) return;

    if (onboardingStatus) {
      const newPath = redirectRoute[onboardingStatus];
      const pathname = router.pathname;
      const redirectPath = withConnectionId(newPath, router.query.connectionId);
      const isCreatingConnection =
        pathname === Path.OnboardingConnection &&
        router.query.mode === 'create';

      // redirect to new path if onboarding is not completed
      if (newPath && newPath !== Path.Modeling) {
        // do not redirect if the new path and router pathname are the same
        if (newPath === pathname) {
          return;
        }

        // allow return back to previous steps
        if (
          router.pathname.startsWith(Path.Onboarding) &&
          onboardingStatus !== OnboardingStatus.ONBOARDING_FINISHED
        ) {
          return;
        }

        router.push(redirectPath, appPath(redirectPath));
        return;
      }

      // redirect to home page if onboarding is completed

      // redirect to the home page when entering the Index page
      if (pathname === '/') {
        router.push(redirectPath, appPath(redirectPath));
        return;
      }

      // redirect to home page since user using sample dataset
      if (
        pathname === Path.OnboardingRelationships &&
        onboardingStatus === OnboardingStatus.WITH_SAMPLE_DATASET
      ) {
        router.push(redirectPath, appPath(redirectPath));
        return;
      }

      // redirect to home page when entering the connection page or select models page
      if (
        [Path.OnboardingConnection, Path.OnboardingModels].includes(
          pathname as Path,
        ) &&
        !isCreatingConnection
      ) {
        router.push(redirectPath, appPath(redirectPath));
        return;
      }
    }
  }, [
    onboardingStatus,
    router.pathname,
    router.query.connectionId,
    router.query.mode,
    shouldBypass,
  ]);

  return {
    loading: shouldBypass ? false : loading,
    onboardingStatus,
  };
};

export default function useOnboardingStatus() {
  const { data, loading, error, refetch } = useOnboardingStatusQuery();

  return {
    loading,
    error,
    refetch,
    onboardingStatus: data?.onboardingStatus?.status,
  };
}
