import api from './axios';
import type { Payment, ApiResponse } from '../types';

export async function list(params: any = {}): Promise<ApiResponse<Payment[]>> {
  const res = await api.get<ApiResponse<Payment[]>>('/payments', { params });
  return res.data;
}

export async function get(id: string): Promise<ApiResponse<{ payment: Payment }>> {
  const res = await api.get<ApiResponse<{ payment: Payment }>>(`/payments/${id}`);
  return res.data;
}

export async function markPaid(id: string, payload: { method: string; reference: string }): Promise<ApiResponse<{ payment: Payment }>> {
  const res = await api.post<ApiResponse<{ payment: Payment }>>(`/payments/${id}/mark-paid`, payload);
  return res.data;
}

export async function cancel(id: string, payload: { reason: string }): Promise<ApiResponse<{ payment: Payment }>> {
  const res = await api.post<ApiResponse<{ payment: Payment }>>(`/payments/${id}/cancel`, payload);
  return res.data;
}