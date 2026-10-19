import api from './axios';

export async function list(params = {}) {
  const res = await api.get('/deliveries', { params });
  return res.data;
}

export async function get(id) {
  const res = await api.get(`/deliveries/${id}`);
  return res.data;
}

export async function create(payload) {
  const res = await api.post('/deliveries', payload);
  return res.data;
}

export async function update(id, payload) {
  const res = await api.patch(`/deliveries/${id}`, payload);
  return res.data;
}

export async function remove(id) {
  const res = await api.delete(`/deliveries/${id}`);
  return res.data;
}