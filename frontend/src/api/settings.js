import api from './axios';

export async function get() {
  const res = await api.get('/settings');
  return res.data;
}

export async function update(payload) {
  const res = await api.patch('/settings', payload);
  return res.data;
}

export async function reset() {
  const res = await api.post('/settings/reset');
  return res.data;
}