import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRouter } from 'next/router';
import PageLoading from '@/components/PageLoading';
import { Role, canAccessPath, getDefaultPathForRole } from '@/utils/rbac';
import { apiPath, appPath } from '@/utils/url';

interface AuthUser {
  id: number;
  adid: string;
  displayName: string;
  role: Role | null;
  roles: Role[];
  tenantId?: number | null;
  workspaceId?: number | null;
  status: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (adid: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const LOGIN_PATH = '/login';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch(apiPath('/api/auth/me'));
      if (!response.ok) {
        setUser(null);
        return;
      }
      const data = await response.json();
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    if (loading) return;

    if (!user && router.pathname !== LOGIN_PATH) {
      router.replace(LOGIN_PATH, appPath(LOGIN_PATH));
      return;
    }

    if (user && router.pathname === LOGIN_PATH) {
      const path = getDefaultPathForRole(user.roles);
      router.replace(path, appPath(path));
      return;
    }

    if (user && !canAccessPath(user.roles, router.pathname)) {
      const path = getDefaultPathForRole(user.roles);
      router.replace(path, appPath(path));
    }
  }, [loading, router.pathname, user]);

  const login = useCallback(async (adid: string, password: string) => {
    const response = await fetch(apiPath('/api/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adid, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    await fetch(apiPath('/api/auth/logout'), { method: 'POST' });
    setUser(null);
    router.replace(LOGIN_PATH, appPath(LOGIN_PATH));
  }, [router]);

  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading, login, logout],
  );

  const shouldRender =
    !loading &&
    (router.pathname === LOGIN_PATH ||
      (!!user && canAccessPath(user.roles, router.pathname)));

  return (
    <AuthContext.Provider value={value}>
      {shouldRender ? children : <PageLoading visible />}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
