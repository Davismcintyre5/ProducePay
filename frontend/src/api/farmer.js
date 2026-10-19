import api from './axios';

export async function list(params = {}) {
  const res = await api.get('/farmers', { params });
  return res.data;
}

export async function get(id) {
  const res = await api.get(`/farmers/${id}`);
  return res.data;
}

export async function statement(id) {
  const res = await api.get(`/farmers/${id}/statement`);
  return res.data;
}

export async function create(payload) {
  const res = await api.post('/farmers', payload);
  return res.data;
}

export async function update(id, payload) {
  const res = await api.patch(`/farmers/${id}`, payload);
  return res.data;
}

export async function remove(id) {
  const res = await api.delete(`/farmers/${id}`);
  return res.data;
}