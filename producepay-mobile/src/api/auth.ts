import axios from 'axios';
import { API_URL, default as api } from './axios';
import type { User, ApiResponse } from '../types';

type LoginResponse = ApiResponse<{ user: User; accessToken: string }>;

export async function login(email: string, password: string): Promise<{
  user: User;
  accessToken: string;
  refreshToken: string | null;
}> {
  const res = await axios.post<LoginResponse>(
    `${API_URL}/auth/login`,
    { email, password },
    { validateStatus: (s) => s < 500 }
  );

  if (res.status !== 200 || !res.data?.data?.accessToken) {
    const msg = res.data?.error?.message || 'Login failed';
    throw new Error(msg);
  }

  const setCookieHeader = res.headers['set-cookie'];
  const setCookie = Array.isArray(setCookieHeader)
    ? setCookieHeader[0]
    : setCookieHeader;
  const match = setCookie ? String(setCookie).match(/pp_refresh=([^;]+)/) : null;
  const refreshToken = match ? match[1] : null;

  return {
    user: res.data.data.user,
    accessToken: res.data.data.accessToken,
    refreshToken
  };
}

export async function me(): Promise<User> {
  const res = await api.get<ApiResponse<{ user: User }>>('/auth/me');
  return res.data.data.user;
}

export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } catch {
    // ignore
  }
}