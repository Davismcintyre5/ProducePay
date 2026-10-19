import api from './axios';
import type { Payment, ApiResponse } from '../types';

export async function list(params: {
  farmerId?: string;
  status?: string;
  from?: string;
  to?: string;
  q?: string;
  page?: number;
  limit?: number;
} = {}): Promise<ApiResponse<Payment[]>> {
  const res = await api.get<ApiResponse<Payment[]>>('/payments', { params });
  return res.data;
}

export async function get(id: string): Promise<ApiResponse<{ payment: Payment }>> {
  const res = await api.get<ApiResponse<{ payment: Payment }>>(`/payments/${id}`);
  return res.data;
}