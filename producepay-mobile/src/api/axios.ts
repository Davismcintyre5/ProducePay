import axios from 'axios';
import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearAll
} from '../lib/secureStore';

export const API_URL = 'https://producepaymoiben.onrender.com/api/v1';

const api = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshing: Promise<string> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    if (status !== 401 || original?.__isRetry) {
      return Promise.reject(error);
    }

    const url = original?.url || '';
    if (url.includes('/auth/login') || url.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    if (!refreshing) {
      refreshing = (async () => {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token');

        const res = await axios.post(
          `${API_URL}/auth/refresh`,
          null,
          {
            headers: { Cookie: `pp_refresh=${refreshToken}` },
            validateStatus: (s) => s < 500
          }
        );

        if (res.status !== 200) {
          await clearAll();
          throw new Error('Session expired');
        }

        const newAccess = res.data?.data?.accessToken;
        if (!newAccess) throw new Error('No access token returned');

        const setCookieHeader = res.headers['set-cookie'];
        const setCookie = Array.isArray(setCookieHeader)
          ? setCookieHeader[0]
          : setCookieHeader;
        const match = setCookie ? String(setCookie).match(/pp_refresh=([^;]+)/) : null;
        const newRefresh = match ? match[1] : refreshToken;

        await saveTokens(newAccess, newRefresh);
        return newAccess;
      })().finally(() => {
        refreshing = null;
      });
    }

    try {
      const newToken = await refreshing;
      original.__isRetry = true;
      original.headers = original.headers ?? {};
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch (err) {
      return Promise.reject(err);
    }
  }
);

export default api;