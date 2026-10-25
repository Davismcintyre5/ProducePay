import api from './axios';

export async function list() {
  const res = await api.get('/backups');
  return res.data;
}

export async function create() {
  const res = await api.post('/backups/create');
  return res.data;
}

export async function restore(file) {
  const formData = new FormData();
  formData.append('backup', file);
  
  const res = await api.post('/backups/restore', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
}

export async function remove(id) {
  const res = await api.delete(`/backups/${id}`);
  return res.data;
}

export async function sendToEmail(id, email) {
  const res = await api.post(`/backups/${id}/email`, { email });
  return res.data;
}