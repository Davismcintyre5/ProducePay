import api from './axios';

export async function login(payload) {
  const res = await api.post('/auth/login', payload);
  return res.data;
}

export async function refresh() {
  const res = await api.post('/auth/refresh');
  return res.data;
}

export async function logout() {
  const res = await api.post('/auth/logout');
  return res.data;
}

export async function me() {
  const res = await api.get('/auth/me');
  return res.data;
}

export async function changePassword(payload) {
  const res = await api.patch('/auth/me/password', payload);
  return res.data;
}

export async function requestReset(payload) {
  const res = await api.post('/auth/request-reset', payload);
  return res.data;
}

export async function verifyReset(payload) {
  const res = await api.post('/auth/verify-reset', payload);
  return res.data;
}