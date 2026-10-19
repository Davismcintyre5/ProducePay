import api from './axios';
import type { Farmer, ApiResponse } from '../types';

export async function list(params: {
  q?: string;
  page?: number;
  limit?: number;
} = {}): Promise<ApiResponse<Farmer[]>> {
  const res = await api.get<ApiResponse<Farmer[]>>('/farmers', { params });
  return res.data;
}

export async function get(id: string): Promise<ApiResponse<{ farmer: Farmer }>> {
  const res = await api.get<ApiResponse<{ farmer: Farmer }>>(`/farmers/${id}`);
  return res.data;
}