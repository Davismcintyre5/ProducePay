import api from './axios';

export async function dashboard() {
  const res = await api.get('/reports/dashboard');
  return res.data;
}

export async function weekly() {
  const res = await api.get('/reports/weekly');
  return res.data;
}

export async function farmerSummary(id) {
  const res = await api.get(`/reports/farmer/${id}`);
  return res.data;
}

export async function downloadCsv(params = {}) {
  const res = await api.get('/reports/export.csv', {
    params,
    responseType: 'blob'
  });

  const blob = new Blob([res.data], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `deliveries-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}