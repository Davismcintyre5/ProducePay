import api from './axios';

export async function list(params = {}) {
  const res = await api.get('/users', { params });
  return res.data;
}

export async function get(id) {
  const res = await api.get(`/users/${id}`);
  return res.data;
}

export async function create(payload) {
  const res = await api.post('/users', payload);
  return res.data;
}

export async function update(id, payload) {
  const res = await api.patch(`/users/${id}`, payload);
  return res.data;
}

export async function remove(id) {
  const res = await api.delete(`/users/${id}`);
  return res.data;
}

export async function resetPassword(id, payload) {
  const res = await api.post(`/users/${id}/reset-password`, payload);
  return res.data;
}