import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useOnboardingStatusQuery } from '@/apollo/client/graphql/onboarding.generated';
import { OnboardingStatus } from '@/apollo/client/graphql/__types__';
import { Path } from '@/utils/enum';

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

        router.push(newPath);
        return;
      }

      // redirect to home page if onboarding is completed

      // redirect to the home page when entering the Index page
      if (pathname === '/') {
        router.push(newPath);
        return;
      }

      // redirect to home page since user using sample dataset
      if (
        pathname === Path.OnboardingRelationships &&
        onboardingStatus === OnboardingStatus.WITH_SAMPLE_DATASET
      ) {
        router.push(newPath);
        return;
      }

      // redirect to home page when entering the connection page or select models page
      if (
        [Path.OnboardingConnection, Path.OnboardingModels].includes(
          pathname as Path,
        ) &&
        !isCreatingConnection
      ) {
        router.push(newPath);
        return;
      }
    }
  }, [onboardingStatus, router.pathname, shouldBypass]);

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
