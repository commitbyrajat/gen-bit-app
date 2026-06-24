import { useEffect } from 'react';
import { useRouter } from 'next/router';
import PageLoading from '@/components/PageLoading';
import { useAuth } from '@/hooks/useAuth';
import { getDefaultPathForRole } from '@/utils/rbac';
import { appPath } from '@/utils/url';

export default function Index() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const path = getDefaultPathForRole(user.roles);
      router.replace(path, appPath(path));
    }
  }, [router, user]);

  return <PageLoading visible />;
}
