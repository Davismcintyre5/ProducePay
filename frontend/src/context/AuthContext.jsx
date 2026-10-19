import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import api from '@/api/axios';
import * as authApi from '@/api/auth';

const SESSION_KEY = 'pp_has_session';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const bootedRef = useRef(false);

  const applyToken = useCallback((token) => {
    setAccessToken(token || null);
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common.Authorization;
    }
  }, []);

  const applyUser = useCallback((next) => {
    setUser(next || null);
    setStatus(next ? 'authenticated' : 'anonymous');
  }, []);

  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;

    const hasSession = localStorage.getItem(SESSION_KEY) === '1';

    if (!hasSession) {
      setStatus('anonymous');
      return;
    }

    (async () => {
      try {
        const res = await authApi.refresh();
        applyToken(res.data.accessToken);

        const me = await authApi.me();
        applyUser(me.data.user);
      } catch {
        localStorage.removeItem(SESSION_KEY);
        applyToken(null);
        applyUser(null);
      }
    })();
  }, [applyToken, applyUser]);

  const login = useCallback(
    async (email, password) => {
      setError(null);
      try {
        const res = await authApi.login({ email, password });
        localStorage.setItem(SESSION_KEY, '1');
        applyToken(res.data.accessToken);
        applyUser(res.data.user);
        return res.data.user;
      } catch (err) {
        const msg = err?.response?.data?.error?.message || 'Login failed';
        setError(msg);
        throw err;
      }
    },
    [applyToken, applyUser]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    localStorage.removeItem(SESSION_KEY);
    applyToken(null);
    applyUser(null);
  }, [applyToken, applyUser]);

  const hasRole = useCallback(
    (...roles) => {
      if (!user) return false;
      if (!roles.length) return true;
      return roles.includes(user.role);
    },
    [user]
  );

  const value = useMemo(
    () => ({
      user,
      accessToken,
      status,
      error,
      isAuthenticated: status === 'authenticated',
      isLoading: status === 'loading',
      login,
      logout,
      hasRole
    }),
    [user, accessToken, status, error, login, logout, hasRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;