import { useEffect } from 'react';
import { useRouter } from 'next/router';
import PageLoading from '@/components/PageLoading';
import { useAuth } from '@/hooks/useAuth';
import { getDefaultPathForRole } from '@/utils/rbac';

export default function Index() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.replace(getDefaultPathForRole(user.roles));
    }
  }, [router, user]);

  return <PageLoading visible />;
}
