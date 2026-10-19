import api from './axios';

export async function list(params = {}) {
  const res = await api.get('/payments', { params });
  return res.data;
}

export async function get(id) {
  const res = await api.get(`/payments/${id}`);
  return res.data;
}

export async function markPaid(id, payload) {
  const res = await api.post(`/payments/${id}/mark-paid`, payload);
  return res.data;
}

export async function cancel(id, payload) {
  const res = await api.post(`/payments/${id}/cancel`, payload);
  return res.data;
}

export async function downloadReceipt(id, receiptNo) {
  const res = await api.get(`/payments/${id}/receipt.pdf`, {
    responseType: 'blob'
  });

  const blob = new Blob([res.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${receiptNo || 'receipt'}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}