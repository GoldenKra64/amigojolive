import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  registerUnauthorizedHandler,
  TOKEN_STORAGE_KEY,
} from '../api/client';
import {
  fetchMe,
  login as loginRequest,
} from '../api/auth.service';
import type { AuthUser, LoginPayload, MeResponse } from '../types';

interface AuthContextValue {
  user: AuthUser | null;
  profile: MeResponse | null;
  token: string | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  logout: () => void;
  refreshMe: () => Promise<MeResponse | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function meToAuthUser(me: MeResponse): AuthUser {
  return {
    id: me.id,
    institutionalEmail: me.institutionalEmail,
    firstName: me.firstName,
    lastName: me.lastName,
    role: me.role,
    status: me.status,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_STORAGE_KEY)
  );
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(token));
  const logoutCalledRef = useRef(false);

  const logout = useCallback(() => {
    if (logoutCalledRef.current) {
      logoutCalledRef.current = false;
    }
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
    setProfile(null);
  }, []);

  const refreshMe = useCallback(async () => {
    try {
      const me = await fetchMe();
      setProfile(me);
      setUser(meToAuthUser(me));
      return me;
    } catch {
      return null;
    }
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const result = await loginRequest(payload);
    localStorage.setItem(TOKEN_STORAGE_KEY, result.token);
    setToken(result.token);
    setUser(result.user);
    setProfile(null);
    return result.user;
  }, []);

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      logout();
    });
  }, [logout]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchMe()
      .then((me) => {
        if (cancelled) return;
        setProfile(me);
        setUser(meToAuthUser(me));
      })
      .catch(() => {
        if (cancelled) return;
        logout();
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, logout]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      token,
      loading,
      login,
      logout,
      refreshMe,
    }),
    [user, profile, token, loading, login, logout, refreshMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return ctx;
}
